export function makeStamp(action, user){
    const who = user?.f$irtName ? user.firstName.toLowerCase() : 'user'
    return '${actiont} ${who} ${new Date().toISOString().slice(0, 10)}'
}
