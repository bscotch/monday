
export class MondayUser {

  private _id = 0;
  private _name = "";
  private _email = "";

  /** For use by non-Monday services where the Monday user
   *  needs to be linked to an internal user, can use this field
   *  (and extend this class to provide types for it). */
  public linkedAccount: any;

  constructor(userInfo:{id:number,name:string,email:string}){
    this.updateWithRemoteData(userInfo);
  }

  get id(){ return this._id; }
  get name(){ return this._name; }
  get email(){ return this._email; }

  updateWithRemoteData (options: Partial<MondayUser>){
    this._id = options.id || this._id;
    this._name = options.name || this._name;
    this._email = options.email || this._email;
    return this;
  }

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