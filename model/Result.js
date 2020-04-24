const {
    CODE_ERROR,
    CODE_SUCCESS,
    CODE_TOKENERROR
} = require('../utils/constant')

class Result {
    constructor(data, msg = '操作成功', options) {
        this.data = null
        if (arguments.length === 0) {
            this.msg = '操作成功'
        } else if (arguments.length === 1) {
            this.msg = data
        } else {
            this.data = data
            this.msg = msg
            if (options) {
              this.options = options
            }
        }
    }

    createResult () {
      if (!this.code) {
        this.code = CODE_SUCCESS
      }
      let base = {
        code: this.code,
        msg: this.msg
      }
      if (this.data) {
        base.data = this.data
      }
      if (this.options) {
        base = {...base, ...this.options}
      }
      return base
    }

    json(res) {
      res.json(this.createResult())
    }

    success(res) {
      this.code = CODE_SUCCESS
      this.json(res)
    }

    fail(res) {
      this.code = CODE_ERROR
      this.json(res)
    }

    tokenError(res) {
      this.code = CODE_TOKENERROR
      this.json(res)
    }
}

module.exports = Result