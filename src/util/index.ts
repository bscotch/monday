import util from "util";

export function deeplog (something:any){
  console.log(util.inspect(something,false,null));
}

const emailRegex = /^[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

export function isValidEmail(email:string){
  if(!email || typeof email != 'string'){
    return false;
  }
  // Sourced from https://github.com/manishsaraan/email-validator/blob/master/index.js
  return emailRegex.test(email);
}

export function isDate(date:Date){
  return !isNaN(new Date(date).getTime());
}