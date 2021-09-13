#1 criar politicas de segurança
#2 criar roles de segurança

aws iam create-role \
    --role-name lambda-test \
    --assume-role-policy-document file://politicas.json
    | sudo tee logs/role.log


#3 zipar arquivos
zip function.zip index.js

aws lambda create-function \
    --function-name hello-cli \
    --zip-file fileb://function.zip \
    --handler index.handler \
    --runtime nodejs12.x \
    --role arn:aws:iam::583194721878:role/lambda-test \
    | sudo tee logs/lambda-create.log

#4 Invoke lambda
aws lambda invoke \
    --function-name hello-cli \
    --log-type Tail \
    logs/lambda-exec.log

#Atualizar lambda
aws lambda update-function-code \
    --function-name hello-cli \
    --zip-file fileb://function.zip \
    --publish \
    | sudo tee logs/lambda-update.log