
export class MondayTag {
  private _id = "";
  private _name = "";
  private _color = "";

  constructor(options:{id:string,name:string,color:string}){
    this._id = options.id;
    this._name = options.name;
    this._color = options.color;
  }

  get id() { return this._id; }
  get name() { return this._name; }
  get color() {return this._color; }


  get asObject(){
    return {
      id: this._id,
      name: this._name,
      color: this._color,
    };
  }
  toObject(){
    return this.asObject;
  }
}
