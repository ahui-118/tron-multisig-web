let tronWeb;

async function connectWallet() {
  if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
    tronWeb = window.tronWeb;
    document.getElementById("wallet-status").innerText = "已连接: " + tronWeb.defaultAddress.base58;
  } else {
    alert("请安装 TronLink 插件并登录账户");
  }
}

async function savePermissions() {
  const addr = tronWeb.defaultAddress.base58;
  const acc = await tronWeb.trx.getAccount(addr);
  const data = {
    owner: acc.owner_permission,
    actives: acc.active_permission
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'permissions.json';
  a.click();
  showOutput("✅ 权限结构已导出");
}

async function resetToSingle() {
  const addr = tronWeb.defaultAddress.base58;
  const hex = tronWeb.address.toHex(addr);
  const tx = await tronWeb.transactionBuilder.updateAccountPermissions(
    addr,
    {
      type: 0,
      permission_name: 'owner',
      threshold: 1,
      keys: [{ address: hex, weight: 1 }]
    },
    null,
    []
  );
  const signed = await tronWeb.trx.sign(tx);
  const res = await tronWeb.trx.sendRawTransaction(signed);
  showOutput("🧹 重置成功: " + JSON.stringify(res, null, 2));
}

async function restorePermissions(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    const json = JSON.parse(e.target.result);
    const addr = tronWeb.defaultAddress.base58;
    const tx = await tronWeb.transactionBuilder.updateAccountPermissions(
      addr,
      json.owner,
      null,
      json.actives
    );
    const signed = await tronWeb.trx.sign(tx);
    const res = await tronWeb.trx.sendRawTransaction(signed);
    showOutput("♻️ 恢复成功: " + JSON.stringify(res, null, 2));
  };
  reader.readAsText(file);
}

function showOutput(msg) {
  document.getElementById("output").innerText = msg;
}
