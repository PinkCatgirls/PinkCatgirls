import axios from "axios";

export const getImage = async (url: string) => {
  const { data } = await axios.get(url, { responseType: 'arraybuffer' })
  return data
}