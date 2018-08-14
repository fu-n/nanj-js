var config = {};

config.http_provider = process.env.HTTP_PROVIDER || 'https://ropsten.infura.io/faF0xSQUt0ezsDFYglOe'
config.http_tx = process.env.HTTP_TX || 'https://ropsten.etherscan.io'
config.client_id = process.env.CLIENT_ID || '575958089608922877'
config.secret_id = process.env.SECRET_KEY || 'fF5MSugBFsUEoTiFIiRdUa1rFc5Y8119JVzyWUzJ'
config.nanj_host = process.env.NANJ_HOST || 'staging.nanjcoin.com'
config.path_relay_tx = process.env.PATH_RELAYTX || '/api/relaytx'
config.path_relay_nonce = process.env.PATH_RELAY_NONCE || '/api/relayNonce'
config.basic_auth = process.env.BASIC_AUTH || ''

config.address_meta_nanj_manager = process.env.ADDRESS_META_NANJ_MANAGER || '0x51b4dbd200c2289562ad0845637573469e609ac6'
config.address_nanjcoin_test = process.env.ADDRESS_NANJCOIN_TEST || '0xf7afb89bef39905ba47f3877e588815004f7c861'
config.address_relay_tx = process.env.TXRELAY_ADDRESS || '0x300c9f881b4988ee1dfd71e14d87f189c799884c'
config.address_nanj_founder = process.env.ADDRESS_NANJ_FOUNDER || '0xf0f8b5948cf868bba11737b8289525ccbd89be60'
config.address_dev = process.env.DEV_ADDRESS | '0x6a83aA71baa431eF33B030F4a236A11FAb1F8bF3'

module.exports = config;
