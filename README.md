# nodeMicro
sample microservice implemented by node.js = original : Node.js 마이크로 서비스 코딩공작소

## 01. 수행

마이크로서비스의 구동. ex> 상품 마이크로 서비스
```
# Terminal 01
$> node subProject/distributed/distributor.js

# Terminal 02
$> node micro_gateway.js

# Terminal 03
$> node micro_goods.js

# (Optional) Terminal 04
$> elasticsearch

# (Optional) Terminal 05
$> redis-server

# (Optional) Terminal 06
$> node subProject/logging/micro_logs.js
```
완성 버전을 구동하기 위해서 포트 `9200`에 Elasticsearch, 포트 `6379`에 Redis가 떠있어야 한다. 없이 실행하는 방법은 로깅 마이크로서비스를 구동하지 않으면 된다.

## 98. 의문점
- 20180904 : 캐시 사용시 조회 API 에서 캐시로 가져오는 게 맞지 않을까? Redis 를 도입하면 결과적으로 CD 프로세스에 대해서 2개로 늘어나는 셈인데 감내할만한 코스트인지.

## 99. 책에는 나와있지 않아

#### 01. server.js 의 response function 의 선언법
아래 코드는 콜백으로 돌아올 때 `TypeError [ERR_INVALID_ARG_TYPE]: The first argument must be one of type string or Buffer` 오류를 발생시킨다.
```
let response = function (res, packet) {
	console.log('in response function in server.js', arguments);
	res.write(200, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify(packet));
}
```
아래와 같이 수정 
```
function response(res, packet) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(packet));
}
```

#### 02. mysql 8.0 의 계정 보안 이슈 
mysql 8.0 으로 버전업되면서 클라이언트 암호화 방식이 변경되었다. 구버전의 암호화 방식을 사용하거나 [클라이언트 라이브러리 및 코드를 변경](https://dev.mysql.com/doc/dev/connector-nodejs/8.0/)해야 한다.
```
mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
mysql> flush privileges;
```
[스택오버플로우 질의](https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server)

#### 03. `POST` 호출시 전송타입의 문제
`POST` 요청 chunk 를 가져와서 데이타를 만듬에 있어 책의 소스 코드는 `form-data` 방식으로 처리할 수 없다. 포스트맨과 같은 테스트 툴을 사용해야 한다면 반드시 `x-www-form-urlencoded` 로 처리해야만 함 

#### 04. `node.js` export 의 특수성
`export default function;` 구문이 동작하지 않음. `module.exports = function;` 으로 해야만 컴파일 가능 

#### 05. 일부 라이브러리의 HOME 디렉토리 설정
일반적으로 명령어를 손쉽게 사용하기 위해서 `$SOMETHING_HOME` 변수를 지정하는데 `$SOMETHING_HOME/bin` 안에 실행파일이 있음. 
- redis 는 `src`
- rabbitmq 는 `sbin`
