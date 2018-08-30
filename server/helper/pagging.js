const constant = require('./constants');
class Paging {
    constructor() {
        this.limit = constant.PAGING_LIMIT_DEFAULT;
        this.total;
        this.currentPage = constant.PAGING_OFFSET_DEFAULT;
        this.range;
        this.sort = constant.PAGING_DEFAULT_SORT;
    }
    /**
     * Function get skip
     * 
     */
    getskip() {
        return this.getlimit() * this.getcurrentPage() - this.getlimit();
    }
    /**
     * function set limit
     * @param int limit 
     */
    setlimit(limit) {
        if (limit) {
            this.limit = limit;
        }
    }
    /**
     * function get limit
     * 
     */
    getlimit() {
        return this.limit;
    }
    /**
     * function set total
     * @param int total 
     */
    settotal(total) {
        this.total = total;
    }
    /**
     * function get total
     * 
     */
    gettotal() {
        return this.total;
    }
    /**
     * function set current Page
     * @param int currentPage 
     */
    setcurrentPage(currentPage) {
        if (currentPage && currentPage > 0) {
            this.currentPage = currentPage;
        }
    }
    /**
     * function get current Page
     * 
     */
    getcurrentPage() {
        return parseInt(this.currentPage);
    }
    /**
     * function get sort
     * 
     */
    getsort() {
        return this.sort;
    }
    /**
     * function get range
     * 
     */
    getrange() {
        return Math.ceil(this.gettotal() / this.getlimit());
    }
    /**
     * function get paging
     * 
     */
    getpage() {
        return {
            total: this.gettotal(),
            range: this.getrange(),
            currentPage: this.getcurrentPage(),
            limit: this.getlimit(),
        };
    }

}
module.exports = Paging;