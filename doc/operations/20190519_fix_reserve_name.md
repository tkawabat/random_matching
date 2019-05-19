## reserve db typo直し
* reverseになっていた
* ついでにdeletedカラムを使わないので消す

### コード修正
* https://github.com/tkawabat/random_matching/commit/12b8ab29df095a682027deea8f24c3150e866bcb

### 新テーブルづくり
* getProdMvpを動かす

```
$ sudo node script/getProdMvp.js 5cdfc611d864312426318871
[2019-05-19T05:35:43.360] [INFO] app - connected mongodb: random_matching
(node:24966) DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
(node:24966) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'chara' of null
    at NativeConnection.db.connection.once (/home/bitnami/git/random_matching/script/getProdMvp.js:18:27)
        at process._tickCallback (internal/process/next_tick.js:68:7)
        (node:24966) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a pro
        mise which was not handled with .catch(). (rejection id: 1)
        (node:24966) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-
        zero exit code.

## ctrl+C
## atlasの画面で新テーブルができていることを確認
```

### 旧テーブルのexport

```
$ mongoexport --host random-matching-free-0-shard-0/random-matching-free-0-shard-00-00-hkex0.mongodb.net:27017,random-matching-free-0-shard-00-01-hkex0.mongodb.net:27017,random-matching-free-0-shard-00-02-hkex0.mongodb.net:27017 --ssl --username admin --authenticationDatabase admin --db random_matching --collection=reverses --out reverses_`date "+%Y%m%d_%H%M%S"`.txt
Enter password:

2019-05-19T05:38:45.456+0000    [........................]  random_matching.reverses  0/1  (0.0%)
2019-05-19T05:38:45.827+0000    connected to: random-matching-free-0-shard-0/random-matching-free-0-shard-00-00-hkex0.mongodb.net:27017,random-matching-free-0-shard-00-01-hkex0.mongodb.net:27017,random-matching-free-0-shard-00-02-hkex0.mongodb.net:27017
2019-05-19T05:38:45.952+0000    [########################]  random_matching.reverses  1/1  (100.0%)
2019-05-19T05:38:45.952+0000    exported 1 record
$ ls reverses*txt
reverses_20190519_053838.txt
```

### 新テーブルにimport

```
$ mongoimport --host random-matching-free-0-shard-0/random-matching-free-0-shard-00-00-hkex0.mongodb.net:27017,random-matching-free-0-shard-00-01-hkex0.mongodb.net:27017,random-matching-free-0-shard-00-02-hkex0.mongodb.net:27017 --ssl --username admin --authenticationDatabase admin --db random_matching --collection reserves --file reverses_20190519_053838.txt
Enter password:

2019-05-19T05:42:57.876+0000    connected to: random-matching-free-0-shard-0/random-matching-free-0-shard-00-00-hkex0.mongodb.net:27017,random-matching-free-0-shard-00-01-hkex0.mongodb.net:27017,random-matching-free-0-shard-00-02-hkex0.mongodb.net:27017
2019-05-19T05:42:59.156+0000    imported 1 document
```

### リリース
* 本番リリース
* 動作確認

### 旧テーブル削除
* atlasの画面でテーブル削除

### DBのバックアップを取得
```
T=users; mongoexport --host random-matching-free-0-shard-0/random-matching-free-0-shard-00-00-hkex0.mongodb.net:27017,random-matching-free-0-shard-00-01-hkex0.mongodb.net:27017,random-matching-free-0-shard-00-02-hkex0.mongodb.net:27017 --ssl --username admin --authenticationDatabase admin --db random_matching --collection=${T} --out data/${T}_`date "+%Y%m%d_%H%M%S"`.txt
T=reserves; mongoexport --host random-matching-free-0-shard-0/random-matching-free-0-shard-00-00-hkex0.mongodb.net:27017,random-matching-free-0-shard-00-01-hkex0.mongodb.net:27017,random-matching-free-0-shard-00-02-hkex0.mongodb.net:27017 --ssl --username admin --authenticationDatabase admin --db random_matching --collection=${T} --out data/${T}_`date "+%Y%m%d_%H%M%S"`.txt
```
