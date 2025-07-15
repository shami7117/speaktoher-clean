import React from "react"

interface OrderSummaryProps {
  items: Array<{
    name: string
    price: number
  }>
  total: number
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ items, total }) => {
  return (
    <div className='backdrop-blur-sm rounded-xl shadow-lg mb-8 px-10'>
      <div className='space-y-4'>
        <div className='border-t pt-4 flex justify-between items-center px-4 block'>
          <span className='text-xl font-bold'>Total</span>
          <span className='text-2xl font-bold'>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
