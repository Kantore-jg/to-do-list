//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoListDB");

const itemSchema = {
  name: String,

}

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your to-do list!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: " Hit the checkbox to delete an item."
});

const defaultItems = [item1, item2, item3];


//InsertItems();

app.get("/",async function(req, res) {

//const day = date.getDate();

async function InsertItems(){
  try{
  await Item.insertMany(defaultItems);
  console.log("Successfully saved default items to DB.");
}
catch(err){
  console.log(err);
}}
 
try{
  const foundItems = await Item.find({});
  if (foundItems.length === 0){
    InsertItems();
    res.redirect("/");
  }else{
  res.render("list", {listTitle: "Today", newListItems: foundItems});

  }
}catch (err){
  console.log(err);
}
});
app.post("/",async function(req, res){

  const itemName = req.body.newItem;
  const ListName = req.body.list;

  try{
    const foundItem = await Item.findOne({name:itemName});

      const newItem = new Item({
        name:itemName});
    if (ListName==="Today"){
      await newItem.save();
      res.redirect("/");
    }else{
      const foundList = await List.findOne({name:ListName})
      foundList.items.push(newItem)
      await foundList.save()
      res.redirect("/"+ListName)

    }



      
    
}catch(err){
  console.log(err);
}
});

app.post("/delete",async function(req,res){
  const checkedbox = _.capitalize(req.body.checkbox)
  const listName = req.body.listName;


  if (listName==="Today"){

  try{
    await Item.findByIdAndDelete(checkedbox);
    console.log("Item successfully deleted");
    res.redirect("/");
  }catch(err){
    console.log(err); 
  }
  }else{
    const foundList = await List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkedbox}}})
    await foundList.save()
    console.log("Deleting item:", checkedbox, "from list:", listName);
    res.redirect("/"+listName)
  }


});

const CustomSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List",CustomSchema);


app.get("/:customListName",async function(req,res){
  const customListName = req.params.customListName;
  //InsertItems();
    const ListName = req.body.list;




try{
  const foundInList = await List.findOne({name:customListName})
  

  if (!foundInList){

    const list = new List({
  name:customListName,
  items:defaultItems});
    await list.save()
    console.log("new in the list")
    res.redirect("/"+customListName);
  }else{
    res.render("list",{listTitle: foundInList.name,newListItems: foundInList.items})
    //console.log("already in the list")
  }
}catch (err){
  console.log("make sure for what you're writing in the url")
}
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
