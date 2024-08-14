"use client"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { useEffect, useState } from "react"

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

import "@dialectlabs/blinks/index.css"
import { Action, Blink, ActionsRegistry, useAction } from "@dialectlabs/blinks"
// import { useAction } from '@dialectlabs/blinks/react';
import { useActionSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana"
import { clusterApiUrl } from "@solana/web3.js"

export default function Address() {
  const { connection } = useConnection()
  const { publicKey, signMessage } = useWallet()
  const [balance, setBalance] = useState<number>(0)

  const [action, setAction] = useState<Action | null>(null)
  const actionApiUrl =
    "https://blinks-workshop-git-main-kimerrans-projects.vercel.app/api/actions/transfer-sol"

  const { adapter } = useActionSolanaWalletAdapter(clusterApiUrl("devnet"))
  const { action: actionResponse } = useAction({ url: actionApiUrl, adapter })

  // code for the `getAirdropOnClick` function here
  const getAirdropOnClick = async () => {
    try {
      if (!publicKey) {
        throw new Error("Wallet is not Connected")
      }
      const [latestBlockhash, signature] = await Promise.all([
        connection.getLatestBlockhash(),
        connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL),
      ])
      const sigResult = await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        "confirmed"
      )
      // console.log("hello!")
      if (sigResult) {
        alert("Airdrop was confirmed!")
      }
    } catch (err) {
      alert("You are Rate limited for Airdrop")
    }
  }
  // code for the `getBalanceEvery10Seconds` and useEffect code here
  useEffect(() => {
    if (publicKey) {
      ;(async function getBalanceEvery10Seconds() {
        const newBalance = await connection.getBalance(publicKey)
        setBalance(newBalance / LAMPORTS_PER_SOL)
        setTimeout(getBalanceEvery10Seconds, 10000)
      })()
    }
  }, [publicKey, connection, balance])

  return (
    <main className="flex min-h-screen flex-col items-center justify-evenly p-24">
      <WalletMultiButton style={{}} />

      <button
        className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        onClick={async () => {

          // const result = await connection.getAccountInfo(new PublicKey('37UmxWZnDREabCPaQ5NWsTqVQiZB8ojw7CgJDch78wQf'))
          // console.log('resut', result)

          if (signMessage) {
            const signed = await signMessage(Buffer.from("GM Radar Builers!"))
            console.log("signed", signed)
          }
        }}
      >
        Sign Message
      </button>

      <button
        className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        onClick={async () => {
          const result = await connection.getAccountInfo(publicKey!)
          console.log('resut', result)
        }}
      >
        Get Account Info
      </button>

      {publicKey ? (
        <div className="flex flex-col gap-4">
          <h1>Your Public key is: {publicKey?.toString()}</h1>
          <h2>Your Balance is: {balance} SOL</h2>
          <div>
            <button
              onClick={getAirdropOnClick}
              type="button"
              className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            >
              Get Airdrop
            </button>

            {actionResponse ? (
              <Blink
                stylePreset="x-dark"
                action={actionResponse}
                websiteText={new URL(actionApiUrl).hostname}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <h1>Wallet is not connected</h1>
      )}
    </main>
  )
}
