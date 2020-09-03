//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-chaitanya:TestDB@cluster0.ghwmk.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, "Please check if you have entered the item name"]
  }
});

const listSchema = new mongoose.Schema({

  listName : String,
  items : [itemsSchema]
});

const Item = mongoose.model('Item', itemsSchema); // Document Name or Table Name
const List = mongoose.model('List', listSchema);

const item1 = new Item({                                  // New Row creation in Item document
  itemName: "Welcome to your Todo List!"
});

const item2 = new Item({
  itemName: "Hit the + button to add a new item"
});

const item3 = new Item({
  itemName: "<-- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3];


//const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];


app.get("/", function(req, res) {

  Item.find({}, function(err, founditems) {

    if (err) {
      console.log(err);
    } else {
      if (founditems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err)
          } else {
            console.log("Insert DefaultItems Successful!")
          }
        })
        res.redirect('/');
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: founditems
        });
      }
    }
  })



});

app.get('/:customlist',function(req,res){
  const customList = _.capitalize(req.params.customlist);
  List.findOne( {listName : customList}, function(err,foundList){
    if (!err){
      if(!foundList){
        console.log('List Does not exists');
        const list = new List({
          listName : customList,
          items : defaultItems
        })
        list.save();
        res.redirect("/" +customList);
          }
      else
      {
        console.log('List Exists');
        res.render("list", {
          listTitle: foundList.listName,
          newListItems: foundList.items
        });
      }
    }
  } )

})

app.post("/", function(req, res) {

  const newItem = req.body.newItem;
  const listTitle = req.body.list;
  console.log(listTitle);

  const item = new Item({
    itemName : newItem
  });

  console.log(item);

  if (listTitle === 'Today')
  {
    item.save();
    res.redirect('/');
  } else {

  List.findOne({listName : listTitle},function(err,foundList){
    if(!err) {
      if (foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect('/' +foundList.listName);
      }
    }
  })
}



});

app.post("/delete",function(req,res){
 const checked_item = req.body.checkbox;
 const listTitle = req.body.listname;
 console.log(checked_item);
 console.log(listTitle);

 if (listTitle === 'Today') {
 Item.findByIdAndRemove(checked_item,function(err){
   if(err) {
     console.log(err)
   }
   else {
     console.log("Item Deleted Successfully");
     res.redirect('/');
   }
 })
} else {
  List.findOneAndUpdate({listName : listTitle},{$pull :{items :{_id : checked_item }}},function(err,foundList){
    if(!err) {
      res.redirect('/' +foundList.listName);
    }
  })
}

})



/* app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
}); */

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
