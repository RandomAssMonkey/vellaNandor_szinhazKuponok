import { Body, Controller, Get, Post, Render, Res } from '@nestjs/common';
import * as mysql from 'mysql2';
import { AppService } from './app.service';
import { newCouponDTO } from './newCoupon.dto';
import e, { Response } from 'express';

const conn = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'database',
}).promise();
;

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async index() {
    const [ adatok ] = await conn.execute('SELECT id, title, percentage, code FROM kuponok ORDER BY title');
    console.log(adatok);

    return {adatok}
  }

  @Get('/newCoupon')
  @Render('newCoupon')
  newCouponForm(){
    return{messages: ""}
  }

  @Post('/newCoupon')
  @Render('newCoupon')
  async newCoupon(@Body() newCoupon: newCouponDTO, @Res() res: Response) {
    const title = newCoupon.title;
    const percentage = newCoupon.percentage;
    const code = newCoupon.code;
    const regex: RegExp = /^[A-Z]{4}-\d{6}$/;
    if(title == "" || percentage == "" || code == "") {
      return { messages: "Minden mezőt kötelező kitölteni!"};
    } else if (!(parseInt(percentage) >= 1 && parseInt(percentage) <= 99)){
      return { messages: "A kedvezmény 0 és 99 közötti szám!"};
    }else if(regex.test(code) != true){
      return {messages: "Hibás a kód formátuma!"}
    } else {
      const [ adatok ] = await conn.execute('INSERT INTO kuponok (title, percentage, code) VALUES (?, ?, ?)', [ 
        title,
        percentage,
        code,
      ],
      );
      res.redirect('/');
    }
  }
}
