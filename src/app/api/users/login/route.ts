import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/userModels";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken";


connect()

export async function POST(request: NextRequest){
    try {
        const reqBody = await request.json();
        const {email, password} = reqBody;

        console.log(reqBody)

        //check if user already exists
        const user = await User.findOne({email})
        if(!user){
            return NextResponse.json({error: "User not found"} , {status:400}) 
        }

        //check if password is correct
        const validPassword = await bcryptjs.compare(password, user.password)
        if(!validPassword){
            return NextResponse.json({error: "Invalid password"}, {status:400})
        }

        //create token data
        const tokenData = {
            id: user._id,
            usernames: user.usernames,
            email: user.email,
        }
        //creating token
        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: "1d" })

        const response = NextResponse.json({
            message: "login Successful",
            success: true,
        })
        response.cookies.set("token", token, {
            httpOnly: true,  
        })
        return response;

    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}

