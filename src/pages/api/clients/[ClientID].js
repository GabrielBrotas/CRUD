import Client from '../../../models/Client';
import dbConnect from "../../../services/db";

dbConnect()

export default async function handler(req, res) {
    const { method } = req
    const { ClientID } = req.query

    switch(method) {
        case 'PUT':
            try {
                const {name, email} = req.body

                if(!name && !email) throw 'invalid data'

                await Client.updateOne({_id: ClientID}, {name, email})
                res.status(200).json({success: true })
            } catch(err) {
                console.log(err)
                res.status(500).json({success: false, err})

            }
        break;

        case 'DELETE':
            try{
                await Client.deleteOne({_id: ClientID})

                res.status(201).json({success: true})
            } catch(err) {
                console.log(err)
                res.status(500).json({success: false, err})
            }
        break;
    }
}
  