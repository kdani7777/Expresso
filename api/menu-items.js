const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const express  = require('express');
const menuItemsRouter = express.Router({ mergeParams: true });

module.exports = menuItemsRouter;

menuItemsRouter.param('menuItemId', (req,res,next,id) => {
  db.get(`SELECT * FROM MenuItem WHERE MenuItem.id=$id`, { $id: id }, (error, menuItem) => {
    if(error) {
      next(error);
    } else if(menuItem) {
      req.menuItem = menuItem;
      next();
    } else {
      res.sendStatus(404);
    }
  })
});

menuItemsRouter.get('/', (req,res,next) => {
  db.all(`SELECT * FROM MenuItem WHERE MenuItem.menu_id=${req.params.menuId}`,
    (error, menuItems) => {
      if(error) {
        next(error);
      } else {
        res.status(200).send({ menuItems: menuItems });
      }
  });
});

menuItemsRouter.post('/', (req,res,next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.params.menuId;

  const menuSql = `SELECT * FROM Menu WHERE Menu.id = $menuId;`
  const menuValues = { $menuId: menuId };

  db.get(menuSql, menuValues, (error, menu) => {
    if(error) {
      next(error);
    } else {

      if(!name || !description || !inventory || !price) {
        return res.sendStatus(400);
      }

      const sql = `INSERT INTO MenuItem (name, description, inventory, price, menu_id)
      VALUES ($name, $description, $inventory, $price, $menuId);`;
      const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: menuId };

      db.run(sql, values, function(error) {
        if(error) {
          next(error);
        } else {
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID};`,
            (error, menuItem) => {
              res.status(201).send({ menuItem: menuItem });
          })
        }
      });
    }
  })
});

menuItemsRouter.put('/:menuItemId', (req,res,next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.params.menuId;

  const menuSql = `SELECT * FROM Menu WHERE Menu.id = $menuId;`
  const menuValues = { $menuId: menuId };

  db.get(menuSql, menuValues, (error, menu) => {
    if(error) {
      next(error);
    } else {

      if(!name || !description || !inventory || !price) {
        return res.sendStatus(400);
      }

      const sql = `UPDATE MenuItem SET name=$name, description=$description,
      inventory=$inventory, price=$price
      WHERE MenuItem.id = $menuItemId;`;
      const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuItemId: req.params.menuItemId
      };

      db.run(sql, values, function(error) {
        if(error) {
          next(error);
        } else {
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
            (error, menuItem) => {
              res.status(200).send({ menuItem: menuItem });
          });
        }
      });
    }
  })
});

menuItemsRouter.delete('/:menuItemId', (req,res,next) => {
  const sql = `DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId;`;
  const values = { $menuItemId: req.params.menuItemId };
  db.run(sql, values, (error) => {
    if(error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});
