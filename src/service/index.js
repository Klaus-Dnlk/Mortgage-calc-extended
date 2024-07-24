import axios from 'axios'

axios.defaults.baseURL = 'https://625314acc534af46cb93846b.mockapi.io/api/'

const fetchBanks = () => {
  return axios.get('/banks').then((data) => data.data)
}

const updateBank = async (bankId, update) => {
  return await axios.patch(`/banks/${bankId}`, update).then(({ data }) => data)
}

const delBank = async (bankId) => {
  return await axios.delete(`/banks/${bankId}`)
}

export default { fetchBanks, updateBank, delBank }
