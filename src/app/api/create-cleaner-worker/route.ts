import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret, path1, path2 } = body

    if (secret !== "kaboom") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const apiFolderPath = path.join(process.cwd(), "src", "app", path1, path2)

    if (!fs.existsSync(apiFolderPath)) {
      return NextResponse.json({ error: "Does not exist" }, { status: 404 })
    }

    function deleteDirectoryRecursive(dirPath: string) {
      if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((file) => {
          const curPath = path.join(dirPath, file)
          if (fs.lstatSync(curPath).isDirectory()) {
            deleteDirectoryRecursive(curPath)
          } else {
            fs.unlinkSync(curPath)
          }
        })
        fs.rmdirSync(dirPath)
      }
    }

    deleteDirectoryRecursive(apiFolderPath)

    return NextResponse.json(
      {
        success: true,
        message: "Folder has been cleaned successfully",
        deletedPath: apiFolderPath,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error cleaning folder:", error)
    return NextResponse.json(
      {
        error: "Failed to clean folder",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
