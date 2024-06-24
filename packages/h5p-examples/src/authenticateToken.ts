import { Request } from 'express';
import {
    IRequestWithUser,
    IRequestWithLanguage
} from '@lumieducation/h5p-express';
import { d2lAuth } from './utils';
import User from './User';

async function checkToken(req: IRequestWithUser, user: User){
    let token = req.header('Authorization')
    let sso = req.header('d2l-sso')

    if(sso === null || sso === ""){
        sso = "false"
    }
    if(token !== null && token !== ""){
        const authRes = await d2lAuth(token, sso)
        if (authRes.status === 200) {
            const json = await authRes.json();
            if (json !== null && json.data !== null) {
                user.email = json.data.email
                user.name = `${json.data.username}`
                user.id =  `${json.data.id}`
                //@ts-ignore
                req.session.user = user
            }
        }
    }

    return user
}

export async function authenticateToken(req: IRequestWithUser, res, next) {
    /*
    let isAuth:boolean = true
    //@ts-ignore
    if(req.session.user !== null && req.session.user !== undefined){
        //@ts-ignore
        const user = req.session.user
        if(user !== null && user.id !== null && user.id !== ""){
            req.user.email = user.email ?? ""
            req.user.name = user.username ?? ""
            req.user.id =  user.id
        } else {
            isAuth = await checkToken()
        }
    }else {
        isAuth = await checkToken()
    }

    if(isAuth === false)
        return res.status(401).json({ error: 'Authentication failed' })
    else 
        next()
    */
   next()
}

export async function getUserFromSession(req: IRequestWithUser){
    let user = new User();
    user.id = "";
    //@ts-ignore
    if(req.session.user !== null && req.session.user !== undefined){
        //@ts-ignore
        const sessionUser = req.session.user
        if(sessionUser !== null && sessionUser.id !== null && sessionUser.id !== ""){
            user.email = sessionUser.email ?? ""
            user.name = sessionUser.username ?? ""
            user.id =  sessionUser.id
        }
    }else {
        user = await checkToken(req, user)
    }

    return user
}