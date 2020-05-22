
export class MondayBoardGroup {
  private _id = "";
  private _title = "";

  constructor(options:{id:string,title:string}){
    this._id = options.id;
    this._title = options.title;
  }

  get id() { return this._id; }
  get title() { return this._title; }

  get asObject(){
    return {
      id: this._id,
      title: this._title
    };
  }
  toObject(){
    return this.asObject;
  }
}
