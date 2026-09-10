// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title FairLaunch
/// @notice USDC escrow for a fixed-price token sale with proportional allocation.
/// @dev Deploy one instance per launch. USDC and sale token use their native decimals;
///      `tokenPrice` is expressed as sale-token smallest units per one USDC smallest unit.
contract FairLaunch is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error InvalidConfiguration();
    error SaleNotOpen();
    error SaleStillOpen();
    error AlreadyFinalized();
    error NothingToClaim();
    error NothingToRefund();
    error InsufficientSaleTokens();

    IERC20 public immutable usdc;
    IERC20 public immutable saleToken;
    uint256 public immutable raiseTarget;
    uint256 public immutable saleTokenSupply;
    uint256 public immutable tokenPrice;
    uint64 public immutable startTime;
    uint64 public immutable endTime;

    uint256 public totalCommitted;
    bool public finalized;

    struct Commitment {
        uint256 deposited;
        bool claimed;
    }
    mapping(address => Commitment) public commitments;

    event Committed(address indexed account, uint256 amount);
    event CommitmentRefunded(address indexed account, uint256 amount);
    event Finalized(uint256 totalCommitted, uint256 totalAllocated);
    event Claimed(address indexed account, uint256 tokenAmount, uint256 usdcRefund);

    constructor(
        address initialOwner,
        address usdc_,
        address saleToken_,
        uint256 raiseTarget_,
        uint256 saleTokenSupply_,
        uint256 tokenPrice_,
        uint64 startTime_,
        uint64 endTime_
    ) Ownable(initialOwner) {
        if (
            initialOwner == address(0) || usdc_ == address(0) || saleToken_ == address(0) ||
            raiseTarget_ == 0 || saleTokenSupply_ == 0 || tokenPrice_ == 0 ||
            endTime_ <= startTime_ || endTime_ <= block.timestamp
        ) revert InvalidConfiguration();
        usdc = IERC20(usdc_);
        saleToken = IERC20(saleToken_);
        raiseTarget = raiseTarget_;
        saleTokenSupply = saleTokenSupply_;
        tokenPrice = tokenPrice_;
        startTime = startTime_;
        endTime = endTime_;
    }

    /// @notice Owner must fund the escrow with the full sale token supply before finalization.
    function fundSale(uint256 amount) external onlyOwner {
        saleToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    function commit(uint256 amount) external nonReentrant whenNotPaused {
        if (block.timestamp < startTime || block.timestamp >= endTime || finalized || amount == 0) revert SaleNotOpen();
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        commitments[msg.sender].deposited += amount;
        totalCommitted += amount;
        emit Committed(msg.sender, amount);
    }

    /// @notice A participant can withdraw their full commitment before settlement.
    function refundBeforeFinalization() external nonReentrant {
        if (finalized || block.timestamp >= endTime) revert SaleStillOpen();
        uint256 amount = commitments[msg.sender].deposited;
        if (amount == 0) revert NothingToRefund();
        commitments[msg.sender].deposited = 0;
        totalCommitted -= amount;
        usdc.safeTransfer(msg.sender, amount);
        emit CommitmentRefunded(msg.sender, amount);
    }

    /// @notice Locks the sale terms. Anyone may finalize after the deadline.
    function finalize() external nonReentrant {
        if (block.timestamp < endTime) revert SaleStillOpen();
        if (finalized) revert AlreadyFinalized();
        if (saleToken.balanceOf(address(this)) < saleTokenSupply) revert InsufficientSaleTokens();
        finalized = true;
        emit Finalized(totalCommitted, totalAllocated());
    }

    /// @notice Claims tokens and any USDC not used by the proportional allocation.
    function claim() external nonReentrant {
        if (!finalized) revert SaleStillOpen();
        Commitment storage commitment = commitments[msg.sender];
        if (commitment.claimed || commitment.deposited == 0) revert NothingToClaim();
        commitment.claimed = true;

        uint256 tokenAmount = allocationFor(commitment.deposited);
        uint256 usdcUsed = tokenAmount / tokenPrice;
        uint256 usdcRefund = commitment.deposited - usdcUsed;
        if (tokenAmount > 0) saleToken.safeTransfer(msg.sender, tokenAmount);
        if (usdcRefund > 0) usdc.safeTransfer(msg.sender, usdcRefund);
        emit Claimed(msg.sender, tokenAmount, usdcRefund);
    }

    function allocationFor(uint256 committed) public view returns (uint256) {
        if (totalCommitted == 0) return 0;
        uint256 eligible = totalCommitted < raiseTarget ? totalCommitted : raiseTarget;
        return (committed * saleTokenSupply * eligible) / (totalCommitted * raiseTarget);
    }

    function totalAllocated() public view returns (uint256) {
        if (totalCommitted == 0) return 0;
        uint256 eligible = totalCommitted < raiseTarget ? totalCommitted : raiseTarget;
        return (saleTokenSupply * eligible) / raiseTarget;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
