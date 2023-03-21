const Sequelize = require('sequelize');
var sequelize = new Sequelize('dniyroyn', 'dniyroyn', 'kcS82kscoD4pDCK1kFfyNfDfbbUvT-DD', {
    host: 'ruby.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    }
    , query: { raw: true }
});

var Student = sequelize.define('Student', {
    studentID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    phone: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    isInternationalStudent: Sequelize.BOOLEAN,
    expectedCredential: Sequelize.STRING,
    status: Sequelize.STRING,
    registrationDate: Sequelize.STRING,
});
var Image = sequelize.define('Image', {
    imageID: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    imageUrl: Sequelize.STRING,
    version: Sequelize.INTEGER,
    width: Sequelize.INTEGER,
    height: Sequelize.INTEGER,
    format: Sequelize.STRING,
    resourceType: Sequelize.STRING,
    uploadedAt: Sequelize.DATE,
    originalFileName: Sequelize.STRING,
    mimeType: Sequelize.STRING
});
var Program = sequelize.define('Program', {
    programCode: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    programName: Sequelize.STRING,
});

Program.hasMany(Student, { foreignKey: 'program' });

const initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            console.log("connected to database successfully")
            resolve()
        }
        ).catch(err => { reject("unable to sync the database") })

    });
};

const getAllStudents = () => {
    return new Promise((resolve, reject) => {
        Student.findAll().then(function (data) {
            resolve(data)
        }).catch(err => {
            reject("no results returned (getAllStudents)")
        })
    });
};

const getStudentsByStatus = (status) => {
    return new Promise((resolve, reject) => {
        Student.findAll({ where: { status: status } }).then(function (data) {
            resolve(data)
        }).catch(err => {
            reject("no results returned (getStudentsByStatus)")
        })
    })
}

const getStudentsByProgramCode = (programCode) => {
    return new Promise((resolve, reject) => {
        Student.findAll({ where: { program: programCode } }).then(function (data) {
            resolve(data)
        }).catch(err => {
            reject("no results returned (getStudentsByProgramCode)")
        })
    })
}

const getStudentsByExpectedCredential = (credential) => {
    return new Promise((resolve, reject) => {
        Student.findAll({ where: { expectedCredential: credential } }).then(function (data) {
            resolve(data)
        }).catch(err => {
            reject("no results returned (getStudentsByExpectedCredential)")
        })
    })
}

const getStudentById = (sid) => {
    return new Promise((resolve, reject) => {
        Student.findAll({ where: { studentID: sid } }).then(function (data) {
            resolve(data[0])
        }).catch(err => {
            reject("no results returned (getStudentById)")
        })
    })
}

const getPrograms = () => {
    return new Promise((resolve, reject) => {
        Program.findAll().then(function (data) {
            resolve(data)
        }).catch(err => {
            reject("no results returned (getPrograms)")
        })
    });
};

const addStudent = (StudentData) => {
    return new Promise((resolve, reject) => {
        StudentData.isInternationalStudent = (StudentData.isInternationalStudent) ? true : false;
        for (const property in StudentData) {
            if (StudentData[property] == '') {
                StudentData[property] = null
            }
        }
        Student.create({
            studentID: StudentData.studentID,
            firstName: StudentData.firstName,
            lastName: StudentData.lastName,
            email: StudentData.email,
            phone: StudentData.phone,
            addressStreet: StudentData.addressStreet,
            addressCity: StudentData.addressCity,
            addressState: StudentData.addressState,
            addressPostal: StudentData.addressPostal,
            isInternationalStudent: StudentData.isInternationalStudent,
            expectedCredential: StudentData.expectedCredential,
            status: StudentData.status,
            registrationDate: StudentData.registrationDate,
            program: StudentData.program
        }
        ).then(() => {
            resolve()
        }).catch(err => {
            reject("no results returned (addStudent)")
        })


    })
}

const updateStudent = (StudentData) => {
    return new Promise((resolve, reject) => {
        StudentData.isInternationalStudent = (StudentData.isInternationalStudent) ? true : false;
        for (const property in StudentData) {
            if (StudentData[property] == '') {
                StudentData[property] = null
            }
        }
        Student.update({
            studentID: StudentData.studentID,
            firstName: StudentData.firstName,
            lastName: StudentData.lastName,
            email: StudentData.email,
            phone: StudentData.phone,
            addressStreet: StudentData.addressStreet,
            addressCity: StudentData.addressCity,
            addressState: StudentData.addressState,
            addressPostal: StudentData.addressPostal,
            isInternationalStudent: StudentData.isInternationalStudent,
            expectedCredential: StudentData.expectedCredential,
            status: StudentData.status,
            registrationDate: StudentData.registrationDate,
            program: StudentData.program
        }, {
            where: { studentID: StudentData.studentID }
        }
        ).then(() => {
            resolve()
        }).catch(err => {
            reject("no results returned (updateStudent)")
        })

    })
}


const addImage = (imageData) => {
    return new Promise((resolve, reject) => {
        Image.create({
            imageID: imageData.imageID,
            imageUrl: imageData.imageUrl,
            version: imageData.version,
            width: imageData.width,
            height: imageData.height,
            format: imageData.format,
            resourceType: imageData.resourceType,
            uploadedAt: imageData.uploadedAt,
            originalFileName: imageData.originalFileName,
            mimeType: imageData.mimeType
        }).then(() => {
            resolve()
        }).catch(err => reject("unable to create image"))
    })
}

const getImages = () => {
    return new Promise((resolve, reject) => {
        Image.findAll().then((data) => {
            resolve(data)
        }).catch(err => reject("no results returned (getImages)"))
    })
}

const addProgram = (programData) => {
    return new Promise((resolve, reject) => {
        for (const property in programData) {
            if (programData[property] == '') {
                programData[property] = null
            }
        }
        Program.create({
            programCode: programData.programCode,
            programName: programData.programName
        }).then(() => {
            resolve()
        }).catch(err => reject("unable to create program (addProgram)"))
    })
}
const updateProgram = (programData) => {
    return new Promise((resolve, reject) => {
        for (const property in programData) {
            if (programData[property] == '') {
                programData[property] = null
            }
        }
        Program.update({
            programCode: programData.programCode,
            programName: programData.programName
        }, { where: { programCode: programData.programCode } }).then(() => {
            resolve()
        }).catch(err => reject("unable to update program (updateProgram)"))
    })
}
const getProgramByCode = (pcode) => {
    return new Promise((resolve, reject) => {
        Program.findAll({ where: { programCode: pcode } }).then(function (data) {
            resolve(data[0])
        }).catch(err => {
            reject("no results returned (getProgramByCode)")
        })
    })
}

const deleteProgramByCode = (pcode) => {
    return new Promise((resolve, reject) => {
        Program.destroy({ where: { programCode: pcode } }).then(function () {
            resolve()
        }).catch(err => {
            reject("no results returned (deleteProgramByCode)")
        })
    })
}
const deleteStudentById = (id) => {
    return new Promise((resolve, reject) => {
        Student.destroy({ where: { studentID: id } }).then(function () {
            resolve()
        }).catch(err => {
            reject("no results returned (deleteStudentById)")
        })
    })
}


module.exports = {
    initialize,
    getAllStudents,
    getPrograms,
    getStudentsByStatus,
    getStudentById,
    getStudentsByExpectedCredential,
    getStudentsByProgramCode,
    addStudent,
    updateStudent,
    addProgram,
    updateProgram,
    getProgramByCode,
    deleteStudentById,
    deleteProgramByCode,
    addImage,
    getImages
};
