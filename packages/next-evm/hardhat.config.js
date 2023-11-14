require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.3',
  solidity: {
    compilers: [
      {
        version: "0.8.12",
      },
      {
        version: "0.8.20",
        settings: {},
      },
    ],
  },
  networks: {
    mumbai: {
      url: 'https://rpc-mumbai.maticvigil.com/',
      accounts: ['4c7ed9d4de052ce604b3836a856fb98944c19a2202c8e002fc2bd2f8551bd12c'],
    },
  },
};