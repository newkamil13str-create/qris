export interface PakasirPayment {
  project: string
  order_id: string
  amount: number
  fee: number
  total_payment: number
  payment_method: string
  payment_number: string
  expired_at: string
}

export async function createQrisTransaction(params: {
  orderId: string
  amount: number
}): Promise<PakasirPayment> {
  const res = await fetch(
    `${process.env.PAKASIR_BASE_URL}/transactioncreate/qris`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project: process.env.PAKASIR_SLUG,
        order_id: params.orderId,
        amount: params.amount,
        api_key: process.env.PAKASIR_API_KEY,
      }),
    }
  )
  if (!res.ok) {
    throw new Error(`Pakasir error: ${res.status}`)
  }
  const data = await res.json()
  return data.payment as PakasirPayment
}

export async function checkTransactionStatus(orderId: string): Promise<{ status: string; paid_at?: string }> {
  const res = await fetch(
    `${process.env.PAKASIR_BASE_URL}/transaction/${orderId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PAKASIR_API_KEY}`,
      },
    }
  )
  if (!res.ok) return { status: 'PENDING' }
  const data = await res.json()
  return data
}
