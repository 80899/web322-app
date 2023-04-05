/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this
*  assignment has been copied manually or electronically from any other source (including web sites) or 
*  distributed to other students.
* 
*  Name: __________Mohammad Hadian____________ Student ID: ______145753208________ Date: ____5 April____________
*
*  Online (Cyclic) Link: https://smiling-purse-calf.cyclic.app
*
********************************************************************************/




var express = require("express");
var path = require("path");
const bodyParser = require('body-parser');
const exphbs = require("express-handlebars")
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const clientSessions = require('client-sessions')

var data = require("./data-service");
const dataServiceAuth = require('./data-service-auth')


const upload = multer()

cloudinary.config({
  cloud_name: "dxcfodtcd",
  api_key: "745371167787594",
  api_secret: "AU3MmUEh_DPd8LMyf4NWr1-DUd4",
  secure: true
});



var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use(clientSessions({
  cookieName: "session",
  secret: "MohammadHadian",
  duration: 10 * 60 * 1000,
  activeDuration: 1000 * 60
}))

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.engine('.hbs', exphbs.engine({
  extname: ".hbs", defaultLayout: "main", helpers: {
    navLink: function (url, options) {
      return '<li' +
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    }


  }
}));
app.set('view engine', '.hbs');

app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
  next();
});


var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  data.initialize()
  dataServiceAuth.initialize()
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('./views'))
app.use(express.static('./public'))

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function (req, res) {
  res.render('home');
});


// setup another route to listen on /about
app.get("/about", function (req, res) {
  res.render('about')
});



app.get("/students", ensureLogin, (req, res) => {
  if (req.query.status) {
    data.getStudentsByStatus(req.query.status)
      .then((students) => {
        if (students.length > 0) {
          res.render("students", { students: students })
        } else {
          res.render("students", { message: "no results" });
        }
      })
      .catch((err) => res.status(500).send("Error: " + err));
  } else if (req.query.program) {
    data.getStudentsByProgramCode(req.query.program)
      .then((students) => {
        if (students.length > 0) {
          res.render("students", { students: students })
        } else {
          res.render("students", { message: "no results" });
        }
      })
      .catch((err) => res.status(500).send("Error: " + err));
  } else if (req.query.credential) {
    data.getStudentsByExpectedCredential(req.query.credential)
      .then((students) => {
        if (students.length > 0) {
          res.render("students", { students: students })
        } else {
          res.render("students", { message: "no results" });
        }
      })
      .catch((err) => res.status(500).send("Error: " + err));
  } else {
    data.getAllStudents()
      .then((students) => {
        if (students.length > 0) {
          res.render("students", { students: students })
        } else {
          res.render("students", { message: "no results" });
        }
      })
      .catch((err) => res.status(500).send("Error: " + err));
  }
});


app.get("/students/add", ensureLogin, function (req, res) {
  data.getPrograms()
    .then(data => res.render("addStudent", { programs: data }))
    .catch(err => { res.render("addStudent", { programs: [] }); })
});

app.get("/student/:studentId", ensureLogin, (req, res) => {

  // initialize an empty object to store the values
  let viewData = {};

  data.getStudentById(req.params.studentId).then((data) => {
    if (data) {
      viewData.student = data; //store student data in the "viewData" object as "student"
    } else {
      viewData.student = null; // set student to null if none were returned
    }
  }).catch(() => {
    viewData.student = null; // set student to null if there was an error 
  }).then(data.getPrograms)
    .then((data) => {
      viewData.programs = data; // store program data in the "viewData" object as "programs"

      // loop through viewData.programs and once we have found the programCode that matches
      // the student's "program" value, add a "selected" property to the matching 
      // viewData.programs object

      for (let i = 0; i < viewData.programs.length; i++) {
        if (viewData.programs[i].programCode == viewData.student.program) {
          viewData.programs[i].selected = true;
        }
      }

    }).catch(() => {
      viewData.programs = []; // set programs to empty if there was an error
    }).then(() => {
      if (viewData.student == null) { // if no student - return an error
        res.status(404).send("Student Not Found");
      } else {
        res.render("student", { viewData: viewData }); // render the "student" view
      }
    }).catch((err) => {
      res.status(500).send("Unable to Show Students");
    });
});


app.get("/images/add", ensureLogin, function (req, res) {
  res.render('addImage')
});

app.post('/images/add', ensureLogin, upload.single('imageFile'), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      return result;
    }

    upload(req).then((uploaded) => {
      processForm(uploaded);
    });
  } else {
    processForm("");
  }

  function processForm(uploaded) {
    let imageData = {};
    imageData.imageID = uploaded.public_id;
    imageData.imageUrl = uploaded.url
    imageData.version = uploaded.version
    imageData.width = uploaded.width
    imageData.height = uploaded.height
    imageData.format = uploaded.format
    imageData.uploadedAt = uploaded.created_at
    imageData.originalFileName = uploaded.original_filename
    imageData.mimeType = uploaded.resource_type
    data.addImage(imageData).then(() => {
      res.redirect('/images')
    }).catch(err => console.log(err))
  }

})

app.get('/images', ensureLogin, function (req, res) {
  data.getImages().then(data => {
    if (data.length > 0) {
      res.render("images", { data: data })
    } else {
      res.render("images", { message: "no results" })
    }
  }).catch(err => console.log(err))
})


// app.get("/intlstudents", (req, res) => {
//   data.getInternationalStudents().then((data) => {
//     res.render('students', { students: data })
//   }).catch((err) => {
//     res.send(err);
//   });
// });
app.get("/programs", ensureLogin, (req, res) => {
  data.getPrograms().then((data) => {
    if (data.length > 0) {
      res.render('programs', { programs: data })
    } else {
      res.render('programs', { programs: data })
    }
  }).catch((err) => {
    res.send(err);
  });
});
app.get('/programs/add', ensureLogin, (req, res) => {
  res.render('addProgram')
})
app.get('/program/:pcode', ensureLogin, (req, res) => {
  const pcode = req.params.pcode;
  data.getProgramByCode(pcode)
    .then((program) => res.render('program', { program: program }))
    .catch((err) => res.status(500).send("Error: " + err));
})

app.get('/programs/delete/:pcode', ensureLogin, (req, res) => {
  data.deleteProgramByCode(req.params.pcode).then(() => {
    res.redirect('/programs')
  }).catch(err => {
    res.send("Unable to Remove Program / Program not found)").status(500)
  })
})
app.get('/students/delete/:studentID', ensureLogin, (req, res) => {
  data.deleteStudentById(req.params.studentID).then(() => {
    res.redirect('/students')
  }).catch(err => res.status(500).send('Unable to Remove Student / Student not found)'))
})
app.get('/login', (req, res) => {
  res.render('login')
})

app.get('/register', (req, res) => {
  res.render('register')
})

app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory')
})

app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect("/")
})

// Post routes
// add the "POST" route for adding a new student
app.post('/students/add', ensureLogin, (req, res) => {
  data.addStudent(req.body)
    .then(() => {
      res.redirect('/students');
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    });
});

app.post("/student/update", ensureLogin, (req, res) => {
  data.updateStudent(req.body).then(() => {
    res.redirect("/students");
  }).catch((err) => res.status(500).send("Error: " + err))
});

app.post('/programs/add', ensureLogin, (req, res) => {
  data.addProgram(req.body)
    .then(() => {
      res.redirect('/programs');
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    });
})

app.post('/program/update', ensureLogin, (req, res) => {
  data.updateProgram(req.body).then(() => {
    res.redirect("/programs");
  }).catch((err) => res.status(500).send("Error: " + err))
})
app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');

  dataServiceAuth.checkUser(req.body).then((user) => {

    req.session.user = {
      userName: user.userName,
      email: user.email,
      loginHistory: user.loginHistory
    }

    res.redirect('/students')
  }).catch(err => {
    res.render('login', { errorMessage: err, userName: req.body.userName })
  })

})
app.post('/register', (req, res) => {
  dataServiceAuth.registerUser(req.body).then(() => {
    res.render('register', { successMessage: "User created" })
  }).catch(err => {
    res.render('register', { errorMessage: err, userName: req.body.userName })
  })
})


// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}