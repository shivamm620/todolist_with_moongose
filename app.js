const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js")
const app = express();
const _ = require("lodash")
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: "true"
}));
let day = date()
app.use(express.static("public"));
mongoose.connect('mongodb://localhost:27017/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
const itemsSchema = new mongoose.Schema({
  name: String
})
const Entry_item = mongoose.model(
  "Item", itemsSchema
)
const item1 = new Entry_item({
  name: "Buy Food"
})
const item2 = new Entry_item({
  name: "Cook Food"
})
const item3 = new Entry_item({
  name: "Eat Food"
})
const Default_items = [item1, item2, item3];
const workSchema = new mongoose.Schema({
  name: {
    required:true,
    type:String
  } ,
  items: [itemsSchema]
})
const work_Entry = mongoose.model(
  "WORK", workSchema
)
app.get("/", (req, res) => {
 
  Entry_item.find({}, (err, docs) => {
    if (docs.length === 0) {
      Entry_item.insertMany(Default_items, (err) => {
        if (err) {
          console.log(err);

        } else {
          console.log("Save Successfully");

        }
      })
      res.redirect("/")
    } else {
      res.render("index", {
        kindDay: day,
        newListItems: docs
      });

    }
  })

});
app.post("/", (req, res) => {
  let item = req.body.newItem
  let listname = req.body.list
  const new_item = Entry_item({
    name:item
 })
  if (listname===day) {
    new_item.save()
    res.redirect("/")
  }else{
    work_Entry.findOne({name:listname},(err,result)=>{
      
      result.items.push(new_item);
      result.save();
      res.redirect("/" + listname)
    })
  }
});
app.get("/:custumename", (req, res) => {
  const userType = _.capitalize(req.params.custumename);
  
  work_Entry.findOne({
    name: userType
  }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const work = new work_Entry({
          name: userType,
          items: Default_items
        })
        work.save();
        res.redirect("/"+ userType)
      } else {
        res.render("index", {
          kindDay: foundList.name,
          newListItems: foundList.items
        })

      }
    }
  })
})
app.post("/deleting", (req, res) => {
  const deleting_Item = req.body.checkedItem;
  const listname = req.body.listname;
  if (listname === day) {
    Entry_item.findByIdAndRemove(deleting_Item, (err) => {
      if (!err) {
        console.log(deleting_Item);
        res.redirect("/")
      } 
    })
  }else{
    work_Entry.findOneAndUpdate({name:listname},{$pull:{items:{_id:deleting_Item}}},(err,foundResult)=>{
      if (!err){
        res.redirect("/"+listname)
      }
    })
  }

 
})

/* app.get("/work", (req, res) => {
  res.render("index", {
    kindDay: "Work List",
    newListItems: WorkItem
  });
}); */

app.listen(3000, () => {
  console.log("server is working on port ");
});