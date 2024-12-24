<template>
  <div class="bg">
    <el-form
      :rules="rules"
      ref="loginForm"
      :model="loginForm"
      class="loginContainer"
    >
      <!-- <h3 class="loginTitle">Leapting后台操作系统</h3> -->
      <!-- b*[^:b#/]+.*$ -->
      <h3 class="loginTitle">丽天智能光伏清洁机器人操控软件</h3>
      <el-form-item prop="username">
        <el-input
          prefix-icon="el-icon-user"
          type="text"
          v-model="loginForm.username"
          placeholder="请输入用户名"
        >
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          prefix-icon="el-icon-lock"
          suffix-icon="el-icon-view"
          type="password"
          v-model="loginForm.password"
          placeholder="请输入密码"
        >
        </el-input>
      </el-form-item>
      <el-form-item prop="code">
        <el-input
          prefix-icon="el-icon-key"
          type="text"
          auto-complete="false"
          v-model="loginForm.code"
          placeholder="点击图片更换验证码"
          style="width: 250px; margin-right: 5px"
        >
        </el-input>
        <img :src="captchaUrl" />
      </el-form-item>
      <el-checkbox v-model="checked" class="loginRemember">记住我</el-checkbox>
      <el-button type="primary" style="width: 100%" @click="submitLogin"
        >登录</el-button
      >
    </el-form>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      captchaUrl: "",
      loginForm: {
        username: "admin",
        password: "123456",
        code: "",
      },
      checked: true,
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 5,
            max: 14,
            message: "长度在 5 到 14 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          ,
          { min: 6, message: "密码长度要大于6", trigger: "blur" },
        ],
        code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
      },
    };
  },
  methods: {
    submitLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          alert("提交成功");
        } else {
          this.$message.error("登录出错请重新输入");
          return false;
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
.bg {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  width: 100%;
  min-height: 100vh;
  background: url(../assets/login-background.jpeg) no-repeat 100% 100%;
  background-position: 50%;
  background-attachment: fixed;
  padding-bottom: 40px;
  overflow: auto;
  background-size: cover;

}

.loginContainer {
  border-radius: 15px;
  width: 430px;
  height: 430px;
  padding: 20px 50px 60px 50px;
  background: #f0f8ffa1;
  box-shadow: 0 0 25px #85d2ff;
}
.loginTitle {
  margin: 20px auto 40px auto;
  text-align: center;
  font-size: 24px;
}
.loginRemember {
  text-align: left;
  margin: 0px 0px 15px 0px;
}

</style>

