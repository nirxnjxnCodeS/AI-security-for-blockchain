// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AdvancedContract
 * @dev Example contract with various constructor argument types to test dynamic modal
 */
contract AdvancedContract {
    // State variables
    address public owner;
    address public treasury;
    uint256 public totalSupply;
    uint8 public decimals;
    bool public isPaused;
    string public name;
    string public symbol;
    bytes32 public merkleRoot;

    // Events
    event Initialized(
        address indexed owner,
        address indexed treasury,
        uint256 totalSupply,
        string name,
        string symbol
    );

    /**
     * @dev Constructor with multiple parameter types
     * @param _owner Contract owner address
     * @param _treasury Treasury address for fees
     * @param _totalSupply Initial total supply
     * @param _decimals Number of decimals (typically 18)
     * @param _isPaused Initial paused state
     * @param _name Token/Contract name
     * @param _symbol Token/Contract symbol
     * @param _merkleRoot Merkle root for whitelist (optional)
     */
    constructor(
        address _owner,
        address _treasury,
        uint256 _totalSupply,
        uint8 _decimals,
        bool _isPaused,
        string memory _name,
        string memory _symbol,
        bytes32 _merkleRoot
    ) {
        require(_owner != address(0), "Owner cannot be zero address");
        require(_treasury != address(0), "Treasury cannot be zero address");
        require(_totalSupply > 0, "Total supply must be greater than 0");
        require(_decimals <= 18, "Decimals cannot exceed 18");

        owner = _owner;
        treasury = _treasury;
        totalSupply = _totalSupply;
        decimals = _decimals;
        isPaused = _isPaused;
        name = _name;
        symbol = _symbol;
        merkleRoot = _merkleRoot;

        emit Initialized(_owner, _treasury, _totalSupply, _name, _symbol);
    }

    // Modifier
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier whenNotPaused() {
        require(!isPaused, "Contract is paused");
        _;
    }

    // Functions
    function pause() external onlyOwner {
        isPaused = true;
    }

    function unpause() external onlyOwner {
        isPaused = false;
    }

    function updateTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Treasury cannot be zero address");
        treasury = _newTreasury;
    }

    function updateMerkleRoot(bytes32 _newMerkleRoot) external onlyOwner {
        merkleRoot = _newMerkleRoot;
    }
}
