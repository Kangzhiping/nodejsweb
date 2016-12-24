function success(text){
    return {level: "success", text: text };
}
function danger(text){
    return {level: "danger", text: text };
}
function info(text){
    return {level: "info", text: text };
}
function warning(text){
    return {level: "warning", text: text };
}
module.exports.success = success;
module.exports.danger = danger;
module.exports.info = info;
module.exports.warning = warning;