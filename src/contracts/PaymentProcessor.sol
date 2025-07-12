// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PaymentProcessor is ReentrancyGuard, Ownable {
    struct Payment {
        address from;
        address to;
        address token;
        uint256 amount;
        string label;
        string memo;
        uint256 timestamp;
        bool completed;
    }

    struct RecurringPayment {
        address from;
        address to;
        address token;
        uint256 amount;
        uint256 frequency; // in seconds
        uint256 lastPayment;
        uint256 totalPayments;
        bool active;
        string label;
    }

    struct EscrowPayment {
        address from;
        address to;
        address token;
        uint256 amount;
        uint256 releaseTime;
        bool released;
        bool refunded;
        string conditions;
    }

    mapping(bytes32 => Payment) public payments;
    mapping(bytes32 => RecurringPayment) public recurringPayments;
    mapping(bytes32 => EscrowPayment) public escrowPayments;
    mapping(address => bytes32[]) public userPayments;
    
    uint256 public platformFee = 25; // 0.25%
    address public feeRecipient;

    event PaymentCreated(bytes32 indexed paymentId, address indexed from, address indexed to, uint256 amount);
    event PaymentCompleted(bytes32 indexed paymentId, address indexed from, address indexed to, uint256 amount);
    event RecurringPaymentCreated(bytes32 indexed paymentId, address indexed from, address indexed to);
    event RecurringPaymentExecuted(bytes32 indexed paymentId, uint256 paymentNumber);
    event EscrowCreated(bytes32 indexed escrowId, address indexed from, address indexed to, uint256 amount);
    event EscrowReleased(bytes32 indexed escrowId, address indexed to, uint256 amount);

    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }

    function createPayment(
        address _to,
        address _token,
        uint256 _amount,
        string memory _label,
        string memory _memo
    ) external returns (bytes32) {
        bytes32 paymentId = keccak256(abi.encodePacked(msg.sender, _to, _amount, block.timestamp));
        
        payments[paymentId] = Payment({
            from: msg.sender,
            to: _to,
            token: _token,
            amount: _amount,
            label: _label,
            memo: _memo,
            timestamp: block.timestamp,
            completed: false
        });

        userPayments[msg.sender].push(paymentId);
        emit PaymentCreated(paymentId, msg.sender, _to, _amount);
        
        return paymentId;
    }

    function executePayment(bytes32 _paymentId) external nonReentrant {
        Payment storage payment = payments[_paymentId];
        require(payment.from == msg.sender, "Not payment creator");
        require(!payment.completed, "Payment already completed");

        uint256 fee = (payment.amount * platformFee) / 10000;
        uint256 netAmount = payment.amount - fee;

        if (payment.token == address(0)) {
            require(msg.value >= payment.amount, "Insufficient ETH");
            payable(payment.to).transfer(netAmount);
            payable(feeRecipient).transfer(fee);
        } else {
            IERC20 token = IERC20(payment.token);
            require(token.transferFrom(msg.sender, payment.to, netAmount), "Token transfer failed");
            require(token.transferFrom(msg.sender, feeRecipient, fee), "Fee transfer failed");
        }

        payment.completed = true;
        emit PaymentCompleted(_paymentId, payment.from, payment.to, payment.amount);
    }

    function createRecurringPayment(
        address _to,
        address _token,
        uint256 _amount,
        uint256 _frequency,
        string memory _label
    ) external returns (bytes32) {
        bytes32 paymentId = keccak256(abi.encodePacked(msg.sender, _to, _amount, _frequency, block.timestamp));
        
        recurringPayments[paymentId] = RecurringPayment({
            from: msg.sender,
            to: _to,
            token: _token,
            amount: _amount,
            frequency: _frequency,
            lastPayment: 0,
            totalPayments: 0,
            active: true,
            label: _label
        });

        emit RecurringPaymentCreated(paymentId, msg.sender, _to);
        return paymentId;
    }

    function executeRecurringPayment(bytes32 _paymentId) external nonReentrant {
        RecurringPayment storage recurring = recurringPayments[_paymentId];
        require(recurring.active, "Recurring payment not active");
        require(
            block.timestamp >= recurring.lastPayment + recurring.frequency,
            "Payment not due yet"
        );

        uint256 fee = (recurring.amount * platformFee) / 10000;
        uint256 netAmount = recurring.amount - fee;

        if (recurring.token == address(0)) {
            require(msg.value >= recurring.amount, "Insufficient ETH");
            payable(recurring.to).transfer(netAmount);
            payable(feeRecipient).transfer(fee);
        } else {
            IERC20 token = IERC20(recurring.token);
            require(token.transferFrom(recurring.from, recurring.to, netAmount), "Token transfer failed");
            require(token.transferFrom(recurring.from, feeRecipient, fee), "Fee transfer failed");
        }

        recurring.lastPayment = block.timestamp;
        recurring.totalPayments++;
        
        emit RecurringPaymentExecuted(_paymentId, recurring.totalPayments);
    }

    function createEscrow(
        address _to,
        address _token,
        uint256 _amount,
        uint256 _releaseTime,
        string memory _conditions
    ) external payable returns (bytes32) {
        bytes32 escrowId = keccak256(abi.encodePacked(msg.sender, _to, _amount, block.timestamp));
        
        if (_token == address(0)) {
            require(msg.value >= _amount, "Insufficient ETH");
        } else {
            IERC20 token = IERC20(_token);
            require(token.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");
        }

        escrowPayments[escrowId] = EscrowPayment({
            from: msg.sender,
            to: _to,
            token: _token,
            amount: _amount,
            releaseTime: _releaseTime,
            released: false,
            refunded: false,
            conditions: _conditions
        });

        emit EscrowCreated(escrowId, msg.sender, _to, _amount);
        return escrowId;
    }

    function releaseEscrow(bytes32 _escrowId) external nonReentrant {
        EscrowPayment storage escrow = escrowPayments[_escrowId];
        require(
            msg.sender == escrow.from || msg.sender == escrow.to || block.timestamp >= escrow.releaseTime,
            "Cannot release escrow yet"
        );
        require(!escrow.released && !escrow.refunded, "Escrow already processed");

        uint256 fee = (escrow.amount * platformFee) / 10000;
        uint256 netAmount = escrow.amount - fee;

        if (escrow.token == address(0)) {
            payable(escrow.to).transfer(netAmount);
            payable(feeRecipient).transfer(fee);
        } else {
            IERC20 token = IERC20(escrow.token);
            require(token.transfer(escrow.to, netAmount), "Token transfer failed");
            require(token.transfer(feeRecipient, fee), "Fee transfer failed");
        }

        escrow.released = true;
        emit EscrowReleased(_escrowId, escrow.to, escrow.amount);
    }

    function batchPayment(
        address[] memory _recipients,
        address _token,
        uint256[] memory _amounts
    ) external payable nonReentrant {
        require(_recipients.length == _amounts.length, "Arrays length mismatch");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            totalAmount += _amounts[i];
        }

        uint256 totalFee = (totalAmount * platformFee) / 10000;

        if (_token == address(0)) {
            require(msg.value >= totalAmount, "Insufficient ETH");
            
            for (uint256 i = 0; i < _recipients.length; i++) {
                uint256 fee = (_amounts[i] * platformFee) / 10000;
                uint256 netAmount = _amounts[i] - fee;
                payable(_recipients[i]).transfer(netAmount);
            }
            payable(feeRecipient).transfer(totalFee);
        } else {
            IERC20 token = IERC20(_token);
            
            for (uint256 i = 0; i < _recipients.length; i++) {
                uint256 fee = (_amounts[i] * platformFee) / 10000;
                uint256 netAmount = _amounts[i] - fee;
                require(token.transferFrom(msg.sender, _recipients[i], netAmount), "Token transfer failed");
            }
            require(token.transferFrom(msg.sender, feeRecipient, totalFee), "Fee transfer failed");
        }
    }

    function getUserPayments(address _user) external view returns (bytes32[] memory) {
        return userPayments[_user];
    }

    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        platformFee = _fee;
    }

    function setFeeRecipient(address _recipient) external onlyOwner {
        feeRecipient = _recipient;
    }
}