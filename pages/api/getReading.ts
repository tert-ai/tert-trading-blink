// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from "next";
import { ActionError } from "./actions";
import { generateReading } from "@/src/generateReading";

export interface ActionPostResponse {
    /** base64 encoded serialized transaction */
    transaction: string;
    /** describes the nature of the transaction */
    message?: string;
  }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ActionPostResponse | ActionError>,
) {
  try {
  if (req.method == 'OPTIONS') {
    return res.status(200).end();   
  } else if (req.method == 'POST') {
    const connection = new Connection('https://nonah-735t00-fast-mainnet.helius-rpc.com')
    const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      const transaction = new Transaction();

      transaction.recentBlockhash = recentBlockhash;
      transaction.feePayer = new PublicKey(req.body.account);
  
      const serializedTransaction = transaction.serialize({requireAllSignatures: false});
      const txString = serializedTransaction.toString('base64')

      const reading = generateReading();
      const messageOptions = [
        `You received Hexagram ${reading.id}: ${reading.name} from the Orb.`,
        `The Orb interprets: ${reading.overall_meaning}`,
        `The Orb advises: ${reading.advice}`,
        `The Orb describes the situation as: ${reading.creative_description}`,
        `${reading.keywords?.toString()} are the Orb's keywords.`,
        `${reading.changing!.length > 0 ? reading.changing?.map((line) => {return line.interpretation}).toString() : 'There are no changes.'}`,
      ]
      res.status(200).json({ transaction: txString, message: messageOptions[Math.floor(Math.random()*messageOptions.length)] });   
      return res;
    } else if (req.method == 'GET') {
      return res.status(200).end();
    }
  } catch (err) {
    if (typeof err === 'string') {
      res.status(500).json({ message: err });
      return res;  
    }
  }
}