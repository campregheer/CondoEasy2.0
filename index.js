const express = require("express");
const mysql = require("mysql2");
const app = express();
const bodyParser = require("body-parser");

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));



const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Dani090707*",
    database: "condominio"
})

connection.connect(function(err){
    if(err){
        console.error("ERRO ", err);
        return
    } console.log("Conexão ok! ")
});

// Consulta de Bloco

app.get("/", function(req, res){
    const select = "Select * from Bloco"

    connection.query(select, function(err, results){
        if (err){
            return res.status(500).send('Erro ao buscar dados')
        }

        res.render("index", { rows: results })
    });

});

app.get("/create", function(req, res){
    res.render("create")
});

app.get("/edit/:idbloco", function(req, res){
    const idbloco = req.params.idbloco;
    const query = 'SELECT * FROM Bloco WHERE idbloco = ?';

    connection.query(query, [idbloco], (err, results) => {
        if (err) return res.status(500).send('Erro ao buscar o bloco');
        if (results.length === 0) return res.status(404).send('Bloco não encontrado');

        res.render('edit', { bloco: results[0] });
    });
});

app.get("/delete/:idbloco", function(req, res){
    const idbloco = req.params.idbloco;

    const excluir = "DELETE FROM Bloco where idbloco = ?" 

    connection.query(excluir, [idbloco], function(err, result){
        if(err){
            console.error("Erro ao excluir o bloco: ", err);
            res.status(500).send('Erro interno ao excluir o bloco.');
            return;
        }else{

        }

        
        console.log("Bloco excluido com sucesso!");
        res.redirect('/');
    });

});


app.post("/edit/:idbloco", function(req, res){
    const idbloco = req.params.idbloco;
    const descricao = req.body.descricao;
    const qtdApt = req.body.qtdApt;

    const update = "UPDATE bloco SET descricao = ?, qtdApt = ? WHERE idbloco = ?";
 
    connection.query(update, [descricao, qtdApt, idbloco], function(err, result){
        if(!err){
            console.log("Bloco editado com sucesso!");
            res.redirect('/'); 
        }else{
            console.log("Erro ao editar o bloco ", err);
            res.send("Erro")
        }
    });
}); 

app.post("/search", function(req, res){
    const search = req.body.pesquisa
    const query = "SELECT * FROM Bloco where descricao = ?"

    connection.query(query, [search], function(err, results){
        if(err){
            return res.status(500).send('Erro ao buscar dados')
        }if(results.length === 0){
            return res.status(404).send(`
                <!DOCTYPE html>
                <html lang="pt-br">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Bloco não existentente</title>
                    <link rel="stylesheet" href="/style.css">

                </head>
                <h1>Bloco não existente</h1>
                <h2>Insira um bloco válido</h2>

                <a href="/" >Voltar</a>
                </html>
                `
            )}
        res.render("index", { rows: results })
    });


});

app.post("/create", function(req, res){
    const descricao = req.body.descricao
    const qtdApt = req.body.qtdApt

    const create = "INSERT INTO bloco (descricao, qtdApt) VALUES (?, ?)"

    connection.query(create, [descricao, qtdApt], function(err, results){
        if (err) {
            console.log("Não foi possível inserir os dados:", err);
            return res.send(`
                <html>
                <h1>ERRO</h1>
                <h2>Bloco ja existente. Por favor, crie um bloco não existente!<h2>
                <a href="/cadastroBloco">Voltar</a>
                </html>
                `);
        }

        console.log("Dados inseridos com sucesso");
        res.redirect("/");
    });
});



// Consulta de apartamentos

app.get("/apartment", function(req, res){
    const select = "SELECT b.descricao, a.numeroApt, a.idapartamento FROM Apartamento a JOIN Bloco b ON a.bloco_id = b.idbloco"

    connection.query(select, function(err, results){
        if (err){
            return res.status(500).send('Erro ao buscar dados')
        }

        res.render("apartment", { rows: results })
    });

});

app.get("/apartment/create", function(req, res){

    const showblocos = "SELECT idbloco, descricao FROM bloco"

    connection.query(showblocos, function(err, result){
        if(err){
            return res.status(500).send('Erro ao buscar dados')
        }

        res.render("createApartment", {rows: result})
    });

});

app.get("/apartment/edit/:idapartamento", function(req, res){
    const idapartamento = req.params.idapartamento;

    const queryApartamento = 'SELECT * FROM Apartamento WHERE idapartamento = ?';
    const queryBlocos = 'SELECT * FROM Bloco';

    connection.query(queryApartamento, [idapartamento], (err, resultsApt) => {
        if (err) return res.status(500).send('Erro ao buscar o apartamento');
        if (resultsApt.length === 0) return res.status(404).send('apartamento não encontrado');

        connection.query(queryBlocos, (err, resultsBlocos) => {
            if (err) return res.status(500).send('Erro ao buscar os blocos');

            res.render('editApartment', { 
                apartamento: resultsApt[0], 
                blocos: resultsBlocos 
            });
        });
    });
});

app.get("/apartment/delete/:idapartamento", function(req, res){
    const idapartamento = req.params.idapartamento;

    const excluir = "DELETE FROM Apartamento where idapartamento = ?" 

    connection.query(excluir, [idapartamento], function(err, result){
        if(err){
            console.error("Erro ao excluir o apartamento: ", err);
            res.status(500).send('Erro interno ao excluir o apartamento.');
            return;
        }

        
        console.log("Apartamento excluido com sucesso!");
        res.redirect('/apartment');
    });

});


app.post("/apartment/edit/:idapartamento", function(req, res){
    const idapartamento = req.params.idapartamento;
    const numApt = req.body.numApt;
    const idbloco = req.body.bloco;

    const update = "UPDATE Apartamento SET numeroApt = ?, bloco_id = ? WHERE idapartamento = ?";
 
    connection.query(update, [numApt, idbloco, idapartamento], function(err, result){
        if(!err){
            console.log("Apartamento editado com sucesso!");
            res.redirect('/apartment'); 
        }else{
            console.log("Erro ao editar o apartamento ", err);
            res.send("Erro")
        }
    });
}); 

app.post("/apartment/search", function(req, res){
    const search = req.body.pesquisa
    const query = "SELECT b.descricao, a.numeroApt FROM Apartamento a JOIN Bloco b ON a.bloco_id = b.idbloco where numeroApt = ?"

    connection.query(query, [search], function(err, results){
        if(err){
            return res.status(500).send('Erro ao buscar dados')
        }if(results.length === 0){
            return res.status(404).send(`
                <!DOCTYPE html>
                <html lang="pt-br">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Apartamento não existentente</title>
                    <link rel="stylesheet" href="/style.css">

                </head>
                <h1>Apartamento não existente</h1>
                <h2>Insira um apartamento válido</h2>

                <a href="/apartment" >Voltar</a>
                </html>
                `
    )}

        res.render("apartment", { rows: results })
    });


});

app.post("/apartment/create", function(req, res){
    const bloco = req.body.bloco
    const numApt = req.body.numeroApt


    const create = "insert into Apartamento(bloco_id, numeroApt) values (?, ?)"

    connection.query(create, [bloco, numApt], function(err, results){
        if(err){
            console.log("Não foi possível inserir os dados:", err);
            return res.send(`
                <html>
                <head>
                <link rel="stylesheet" href="/style.css">
                </head>
                <h1>ERRO</h1>
                <h2>Apartamento ja existente. Por favor, crie um apartamento novo!<h2>
                <a href="/apartment/create">Voltar</a>
                </html>
                `);
        }

        console.log("Dados inseridos com sucesso");
        res.redirect("/apartment");
        
    });
});

// Consulta de moradores

app.get("/residents", function(req, res){
    const queryResidents = "SELECT Morador.idmorador AS idmorador, Morador.cpf, Morador.nome, Apartamento.numeroApt AS apartamento, Bloco.descricao AS bloco FROM Morador JOIN Apartamento ON Morador.apt_id = Apartamento.idapartamento JOIN Bloco ON Morador.bloco_id = Bloco.idbloco ORDER BY bloco;"

    connection.query(queryResidents, function(err, results){
        if(err){
            return res.status(500).send('Erro ao buscar dados')
        }

        res.render("residents", { rows: results })
    });
});

app.get("/residents/create", function(req, res) {
    const blocoSelecionado = req.query.idbloco; 

    const showblocos = "SELECT idbloco, descricao FROM bloco";
    const showApt = "SELECT idapartamento, numeroApt FROM Apartamento WHERE bloco_id = ?";

    connection.query(showblocos, function(err, blocos) {
        if (err) {
            return res.status(500).send('Erro ao buscar blocos');
        }

        if (blocoSelecionado) {
            connection.query(showApt, [blocoSelecionado], function(err, apartamentos) {
                if (err) {
                    return res.status(500).send('Erro ao buscar apartamentos');
                }

                res.render("createResident", {
                    blocos: blocos,
                    apartamentos: apartamentos,
                    blocoSelecionado: blocoSelecionado
                });
            });
        } else {
            res.render("createResident", {
                blocos: blocos,
                apartamentos: [],
                blocoSelecionado: null
            });
        }
    });
});
app.get("/residents/delete/:idmorador", function(req,res){
    const idmorador = req.params.idmorador;

    const excluirCarro = "DELETE FROM veiculo where morador_id = ?" 
    const excluir = "DELETE FROM Morador where idmorador = ?" 

    connection.query(excluirCarro, [idmorador], function(err, result){
        if(err){
            console.error("Erro ao excluir o veiculo: ", err);
            res.status(500).send('Erro interno ao excluir veiculo.');
            return;
        }
    
    connection.query(excluir, [idmorador], function(err, result){
        if(err){
            console.error("Erro ao excluir o morador: ", err);
            res.status(500).send('Erro interno ao excluir morador.');
            return;
        }
        
        console.log("Morador e veiculo excluidos com sucesso!");
        res.redirect('/residents');
    });
});
});
app.get("/residents/edit/:idmorador", function(req, res){
    const idmorador = req.params.idmorador;
    const blocoSelecionado = req.query.idbloco; 

    const queryMorador = 'SELECT * FROM Morador WHERE idmorador = ?';
    const showblocos = "SELECT idbloco, descricao FROM bloco";
    const showApt = "SELECT idapartamento, numeroApt FROM Apartamento WHERE bloco_id = ?";


    connection.query(queryMorador, [idmorador], function(err, morador){
        if (err) return res.status(500).send('Erro ao buscar o morador');
        if (morador.length === 0) return res.status(404).send('morador não encontrado');
     
        const moradorData = morador[0];   
     
        connection.query(showblocos, function(err, blocos) {
            if (err) {
                return res.status(500).send('Erro ao buscar blocos');
            }
     
            if (blocoSelecionado) {
                connection.query(showApt, [blocoSelecionado], function(err, apartamentos) {
                    if (err) {
                        return res.status(500).send('Erro ao buscar apartamentos');
                    }
     
                    res.render("editResident", {
                        morador: moradorData,  
                        blocos: blocos,
                        apartamentos: apartamentos,
                        blocoSelecionado: blocoSelecionado
                    });
                });
            } else {
                res.render("editResident", {
                    morador: moradorData, 
                    blocos: blocos,
                    apartamentos: [],
                    blocoSelecionado: null
                });
            }
        });
     });
     
});


app.post("/residents/edit/:idmorador", function(req, res){
    const idmorador = req.params.idmorador;
    const cpf = req.body.cpf
    const name = req.body.name
    const apartment = req.body.apartment
    const block = req.body.idbloco
    const fone = req.body.fone
    const manager = req.body.manager
    const owner = req.body.owner
    const car = req.body.car
    const carSpaces = req.body.carSpaces || null
    const numSpaces = req.body.numSpaces || null
    const plate = req.body.plate
    const brand = req.body.brand
    const model = req.body.model

    const update = `
    UPDATE morador
    SET cpf = ?, nome = ?, apt_id = ?, bloco_id = ?, telefone = ?,
        responsavel_apt = ?, proprietario_apt = ?, possui_veiculo = ?,
        qtd_vagas = ?, num_vaga = ?
    WHERE idmorador = ?
  `; 

  const values = [cpf, name, apartment, block, fone, manager, owner, car, carSpaces, numSpaces, idmorador];
    connection.query(update, values, function(err, morador){
        if(err){
            console.log("Não foi possível inserir os dados:", err);
            return res.send(`
                <html>
                <head>
                <link rel="stylesheet" href="/style.css">
                </head>
                <h1>ERRO</h1>
                <h2>Dados inseridos não estão conferindo.<h2>
                <p>Para que um morador seja editado com sucesso, siga os passos: </p><br>
                <p>- NÃO insira um CPF repetido (que não o dele próprio); </p><br>
                <p>- NÃO adicione mais de um proprietário ao mesmo apartamento; </p><br>
                
                <a href="/residents/">Voltar</a>
                </html>
                `);
        }

        const idmorador = morador.insertId;

        if(car == 1 && plate && brand && model){

            const updateCar= "UPDATE veiculoSET placa = ?, marca = ?, modelo = ? WHERE morador_id = ?";

            const valuesCar = [plate,brand,model,idmorador];

            connection.query(updateCar, [valuesCar], function(error, car){
                if(error){
                    console.log("Não foi possível inserir os dados:", err);
                console.log("Morador e veículo editados com sucesso")
            res.redirect("/residents")

        }else{
            console.log("Morador editado com sucesso")
            res.redirect("/residents")
        }
            });
        }
    });
}); 
app.post("/residents/search", function(req, res){
    const name = req.body.name
    const query = "SELECT Morador.idmorador AS id, Morador.cpf, Morador.nome, Apartamento.numeroApt AS apartamento, Bloco.descricao AS bloco FROM Morador JOIN Apartamento ON Morador.apt_id = Apartamento.idapartamento JOIN Bloco ON Morador.bloco_id = Bloco.idbloco WHERE Morador.nome LIKE CONCAT('%', ?, '%') ORDER BY bloco"

    connection.query(query, [name], function(err, results){
        if(err){
            console.log(err)
            return res.status(500).send('Erro ao buscar dados')
            
        }if(results.length === 0){
            return res.status(404).send(`
                <!DOCTYPE html>
                <html lang="pt-br">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Morador não existentente</title>
                    <link rel="stylesheet" href="/style.css">

                </head>
                <h1>Morador não existente</h1>
                <h2>Insira um morador válido</h2>

                <a href="javascript:history.back()">Voltar</a>
                </html>
                `
    )}

        res.render("residents", { rows: results })
    })
});
app.post("/residents/create", function(req,res){
    const cpf = req.body.cpf
    const name = req.body.name
    const apartment = req.body.apartment
    const block = req.body.idbloco
    const fone = req.body.fone
    const manager = req.body.manager
    const owner = req.body.owner
    const car = req.body.car
    const carSpaces = req.body.carSpaces || null
    const numSpaces = req.body.numSpaces || null
    const plate = req.body.plate
    const brand = req.body.brand
    const model = req.body.model
    

    const insert = "INSERT INTO Morador (cpf, nome, apt_id, bloco_id, telefone, responsavel_apt, proprietario_apt, possui_veiculo, qtd_vagas, num_vaga) VALUES (?)"
    const values = [cpf, name, apartment, block ,fone, manager, owner, car, carSpaces, numSpaces]
    
    connection.query(insert, [values], function(err, morador){
        if(err){
            console.log("Não foi possível inserir os dados:", err);
            return res.send(`
                <html>
                <head>
                <link rel="stylesheet" href="/style.css">
                </head>
                <h1>ERRO</h1>
                <h2>Dados inseridos não estão conferindo.<h2>
                <p>Para que um morador seja cadastrao com sucesso, siga os passos: </p><br>
                <p>- NÃO insira um CPF repetido; </p><br>
                <p>- NÃO adicione mais de um proprietário ao mesmo apartamento; </p><br>
                
                <a href="/residents/create">Voltar</a>
                </html>
                `);
        }

        const idmorador = morador.insertId;

        if(car == 1 && plate && brand && model){

            const insertCar = "INSERT INTO Veiculo (placa, marca, modelo, morador_id) VALUES (?)"
            const valuesCar= [plate, brand, model, idmorador]

            connection.query(insertCar, [valuesCar], function(error, car){
                if(error){
                    console.log("Não foi possível inserir os dados:", err);
                }
            });

            console.log("Morador e veículo cadastrados com sucesso")
            res.redirect("/residents")

        }else{
            console.log("Morador cadastrado com sucesso")
            res.redirect("/residents")
        }

        
    });



});

// Consulta de pagamentos

app.get("/payment", function(req, res){
    const blocoSelecionado = req.query.idbloco; 
    const aptSelecionado = req.query.idapartamento;
    const Mes = req.query.mesHidden || String(new Date().getMonth() + 1).padStart(2, '0');
    const Ano = req.query.anoHidden || new Date().getFullYear();

    const showblocos = "SELECT idbloco, descricao FROM bloco";
    const showApt = "SELECT idapartamento, numeroApt FROM Apartamento WHERE bloco_id = ?";
    const showResident = "SELECT idmorador, cpf, nome, apt_id, telefone FROM Morador WHERE apt_id = ?";
    const references = "SELECT idreferencia, vencimento, valor FROM referencia WHERE mes = ? AND ano = ?";

    connection.query(showblocos, function(err, blocos) {
        if (err) return res.status(500).send('Erro ao buscar blocos');

        if (blocoSelecionado) {
            connection.query(showApt, [blocoSelecionado], function(err, apartamentos) {
                if (err) return res.status(500).send('Erro ao buscar apartamentos');

                if (aptSelecionado) {
                    connection.query(showResident, [aptSelecionado], function(err, morador) {
                        if (err) return res.status(500).send('Erro ao buscar morador');

                        const moradorData = morador.length > 0 ? morador[0] : null;

                        connection.query(references, [Mes, Ano], function(err, reference){
                            if(err){
                                console.log("erro ao buscar dados", err);
                                return res.render("payment", { reference: [], mesAtual: Mes, anoAtual: Ano });
                            }

                            res.render("payment", {
                                morador: moradorData,
                                blocos: blocos,
                                apartamentos: apartamentos,
                                blocoSelecionado: blocoSelecionado,
                                aptSelecionado: aptSelecionado,
                                reference: reference,
                                mesAtual: Mes,
                                anoAtual: Ano
                            });
                        });
                    });
                } else {
                    res.render("payment", {
                        morador: null,
                        blocos: blocos,
                        apartamentos: apartamentos,
                        blocoSelecionado: blocoSelecionado,
                        aptSelecionado: null,
                        reference: [],
                        mesAtual: Mes,
                        anoAtual: Ano
                    });
                }
            });
        } else {
            res.render("payment", {
                morador: null,
                blocos: blocos,
                apartamentos: [],
                blocoSelecionado: null,
                aptSelecionado: null,
                reference: [],
                mesAtual: Mes,
                anoAtual: Ano
            });
        }
    });
});

app.post("/payment/register", function(req, res){
    const { apartamento_id, morador_id, idreferencia } = req.body;

    const insert = "INSERT INTO pagamento (apartamento_id, morador_id, referencia_id) VALUES (?, ?, ?)";
    const values = [apartamento_id, morador_id, idreferencia]; 

    connection.query(insert, values, function(err, results){
        if(err){
            console.log("Não foi possível inserir os dados:", err);
        }

        console.log("Pagamento registrado com sucesso!")
        res.redirect("/payment")
    })

});

// Manutenção

app.get("/maintenance", function(req,res){
    const query = "SELECT * FROM tipoManutencao"

    connection.query(query, function(err, results){
        if(err){
            console.log("Erro ao buscar dados", err)
        }
        res.render("maintenance", {row: results})
    })


    
});

app.get("/maintenance/options", function(req,res){
    res.render("maintenanceOptions")
});

app.get("/maintenance/type", function(req,res){
    res.render("maintenanceType")
});


app.post("/maintenance/register", function(req, res){
    const tipo_id = parseInt(req.body.tipo_id, 10);
    const date = req.body.date
    const local = req.body.local

    const insert = "INSERT INTO Manutencao (tipo_id, data, local) VALUES (?,?,?)"
    console.log(req.body)
    if (isNaN(tipo_id)) {
            console.log("Erro: tipo_id inválido.");
            return res.status(400).send("Tipo de manutenção inválido.");
        }
        
    connection.query(insert, [tipo_id, date, local], function(err, results){
        if(err){
            if(err){
                console.log("Não foi possível inserir os dados:", err);
            }
        }

        console.log("Tipo de manutenção inserida com sucesso")
        res.redirect("/maintenance/options")
    });
});

app.post("/maintenance/registerType", function(req, res){
    const name = req.body.name

    const insert = "INSERT INTO tipoManutencao (nome) VALUE (?)"

    connection.query(insert, name, function(err, type){
        if(err){
            console.log("Erro ao enviar dados", err)
        }

        console.log("Tipo de manutenção cadastrado com sucesso")
        res.redirect("/maintenance/options")
    })
})

//Visão geral

app.get("/statistic", function(req, res){
    const residentsTotal = "SELECT COUNT(idmorador) FROM morador"
    const apartmentTotal = "SELECT COUNT(idapartamento) FROM apartamento"
    const blocoTotal = "SELECT COUNT(idbloco) FROM bloco"
    const maintenance = "SELECT COUNT(idmanutencao) FROM manutencao"
    const payment = "SELECT COUNT(idpagamento) FROM pagamento"
    const residentsBloco = "SELECT m.idmorador, b.descricao AS nome_bloco FROM morador m JOIN bloco b ON m.bloco_id = b.idbloco;"

    connection.query(residentsTotal, function(err, morador){
        if(err){
            console.log("Erro ao coletar dados", err)

        }
        connection.query(apartmentTotal, function(err, apartamento){
            if(err){
                console.log("Erro ao coletar dados", err)
    
            }
            connection.query(blocoTotal, function(err, bloco){
                if(err){
                    console.log("Erro ao coletar dados", err)
        
                }

                connection.query(maintenance, function(err, manutencao){
                    if(err){
                        console.log("Erro ao coletar dados", err)
            
                    }
                    
                    connection.query(payment, function(err, pagamento){
                        if(err){
                            console.log("Erro ao coletar dados", err)
                
                        }
                        connection.query(residentsBloco, function(err, moradorBloco){
                            if(err){
                                console.log("Erro ao coletar dados", err)
                    
                            }
        
                res.render("statistic", {morador: morador, apartamento:apartamento, bloco: bloco, manutencao:manutencao, pagamento:pagamento, moradorBloco:moradorBloco })
            });
            });
            });
            });
            
        });

    });
});

// const port = process.env.PORT || 3000;
// app.listen(port, function() {
//   console.log(`Servidor rodando na porta ${port}`);
// });

module.exports = app;