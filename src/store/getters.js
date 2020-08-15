const getters = {
    permission_routes: state => state.permission.routes,
    token: state => state.user.token,
    name: state => state.user.name,
    roles: state => state.user.roles
}
export default getters