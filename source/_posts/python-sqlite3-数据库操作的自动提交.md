---
title: python sqlite3 数据库操作的自动提交
date: 2018-12-11 03:08:54
update:
categories:
- 数据库
- sqlite3
tags:
---

在一个爬虫中使用了Sqlite3数据库，在将内容写入数据库时，可以正常执行，并且使用同一个游标可以正常读出数据，但是数据库中并没有内容。

在网上搜索时发现，是因为sqlite的事务控制导致，其中在执行数据库操作时，会有两种commit状态。

```
智能commit状态:
    生成方式: 在connect()中不传入 isolation_level, 此时isolation_level==''
        在进行 执行Data Modification Language (DML) 操作(INSERT/UPDATE/DELETE/REPLACE)时, 会自动打开一个事务,
        在执行 非DML, 非query (非 SELECT 和上面提到的)语句时, 会隐式执行commit
        可以使用 connection.commit()方法来进行提交
    注意:
        不能和cur.execute("COMMIT")共用
    
自动commit状态:
    生成方式: 在connect()中传入 isolation_level=None
        这样,在任何DML操作时,都会自动提交
    事务处理
        connection.execute("BEGIN TRANSACTION")
        connection.execute("COMMIT")
    如果不使用事务, 批量添加数据非常缓慢
```

## 智能commit状态
即在下面这种非数据修改操作时，会自动执行commit操作。
```python
result = c.execute("select * from bing_images")
```

当进行数据库写入时，这种数据修改操作并不会自动提交,需要在执行完成后进行手动提交(需要connection.commit()进行提交)。
```python
c.execute(insert_sql)
conn.commit() # connection
```

## 自动commit状态

在这种情况下，无论是数据修改操作还是非数据修改操作都会自动提交。

