import Home from "@/features/home/components/Home"
import { cookies } from "next/headers"
import React from "react"

export const dynamic = "force-dynamic"

const HomePage = async () => {
  // if (process.env.NODE_ENV === "production") {
  //   redirect("/placeholder")
  // }

  const cookieStore = await cookies()
  const isMember = cookieStore.get("is_member")?.value === "true"

  return (
    <>
      <Home isMember={isMember} />
    </>
  )
}

export default HomePage
