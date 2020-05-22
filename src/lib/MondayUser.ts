
export class MondayUser {

  private _id = "";
  private _name = "";
  private _email = "";

  /** For use by non-Monday services where the Monday user
   *  needs to be linked to an internal user, can use this field
   *  (and extend this class to provide types for it). */
  public linkedAccount: any;

  constructor(userInfo:{id:string,name:string,email:string}){
    this._id = userInfo.id;
    this._name = userInfo.name;
    this._email = userInfo.email;
  }

  get id(){ return this._id; }
  get name(){ return this._name; }
  get email(){ return this._email; }

  get asObject(){
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      linkedAccount: this.linkedAccount
    };
  }
  toObject(){
    return this.asObject;
  }
}