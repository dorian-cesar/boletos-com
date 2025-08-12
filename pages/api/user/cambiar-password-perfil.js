import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

export default async (req, res) => {
    try {
        const postData = req.body;
        let data = await axios.post(config.url_api + `/users/change-password`, postData)
        // let data = await axios.post(`http://localhost:3000/api` + `/users/change-password`, postData)
        res.status(200).json(data.data);
    } catch(error){
        res.status(400).json(error?.response.data);
    }
}   