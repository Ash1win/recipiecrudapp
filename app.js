const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;


app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

const conn = mongoose.connect('mongodb://localhost/reciepeapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

const Schema = mongoose.Schema;

const reciepeSchema = new Schema({
    name: { type: String, index: true },
    image: String,
    ingredients: String,
    procedure: String
});

reciepeSchema.index({ 'name': 'text' });

const reciepeModel = mongoose.model('reciepe', reciepeSchema);

app.use('/reciepeapp', express.static('dist'));



app.get("/", (req, res) => {
    res.redirect("/reciepeapp");
});

app.post("/getReciepeById", (req, res) => {
    reciepeModel.findById(req.body.id, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    });
});

app.post("/searchreciepe", async (req, res) => {
    const searchString = req.body.string;
    const reciepeList = await reciepeModel.find({ name: { $regex: searchString, $options: "i" } }, (err, data) => {
        console.log(searchString);
    });
    res.send(reciepeList);
});

app.get("/listreciepes", async (req, res) => {
    const reciepeList = await reciepeModel.find();
    res.send(reciepeList);
});

app.post('/addreciepe', (req, res) => {
    const newReciepe = new reciepeModel({
        name: req.body.name,
        image: req.body.image,
        ingredients: req.body.ingredients,
        procedure: req.body.procedure
    });

    newReciepe.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log(`reciepe added successfully ${req.body.name}`);
            res.send("success");
        }
    });
});

app.post("/updatereciepe", (req, res) => {
    const id = req.body.id;
    reciepeModel.findByIdAndUpdate(id, {
        name: req.body.name,
        image: req.body.image,
        ingredients: req.body.ingredients,
        procedure: req.body.procedure
    }, (err) => {
        if (err) {
            console.log("err");
        } else {
            res.send("success");
        }
    })
});

app.post("/deletereciepe", (req, res) => {
    const id = req.body.id;
    reciepeModel.findByIdAndDelete(id, (err) => {
        if (err) {
            console.log(err);
        } else {
            res.send("success");
        }
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
