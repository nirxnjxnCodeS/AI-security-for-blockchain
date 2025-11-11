// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AirdropToken
 * @dev Custom ERC20 token with built-in airdrop functionality — no external libraries or interfaces.
 */
contract AirdropToken {
    // --- Token Metadata ---
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    // --- Mappings ---
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // --- Ownership ---
    address public owner;

    // --- Events ---
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Airdrop(address indexed from, address indexed to, uint256 amount);

    // --- Modifiers ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    // --- Constructor ---
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        owner = msg.sender;
        totalSupply = _initialSupply * 10 ** uint256(decimals);
        balanceOf[owner] = totalSupply;
        emit Transfer(address(0), owner, totalSupply);
    }

    // --- Core ERC20 Functions ---

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0), "Invalid address");
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        require(_spender != address(0), "Invalid spender");
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(_to != address(0), "Invalid receiver");
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Allowance exceeded");

        allowance[_from][msg.sender] -= _value;
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(_from, _to, _value);
        return true;
    }

    // --- Minting (Owner Only) ---
    function mint(address _to, uint256 _amount) public onlyOwner {
        require(_to != address(0), "Invalid address");
        totalSupply += _amount;
        balanceOf[_to] += _amount;
        emit Transfer(address(0), _to, _amount);
    }

    // --- Burning (Owner Only) ---
    function burn(uint256 _amount) public onlyOwner {
        require(balanceOf[msg.sender] >= _amount, "Not enough tokens to burn");
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;
        emit Transfer(msg.sender, address(0), _amount);
    }

    // --- Airdrop (Owner Only) ---
    function airdrop(address[] calldata _recipients, uint256[] calldata _amounts) external onlyOwner {
        require(_recipients.length == _amounts.length, "Length mismatch");

        for (uint256 i = 0; i < _recipients.length; i++) {
            address to = _recipients[i];
            uint256 amount = _amounts[i];

            require(to != address(0), "Invalid address");
            require(balanceOf[msg.sender] >= amount, "Insufficient tokens for airdrop");

            balanceOf[msg.sender] -= amount;
            balanceOf[to] += amount;

            emit Airdrop(msg.sender, to, amount);
            emit Transfer(msg.sender, to, amount);
        }
    }

    // --- Ownership Transfer ---
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
