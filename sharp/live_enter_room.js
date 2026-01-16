// live_enter_room.js

const body ={
    "ret": 200,
    "data": {
        "code": 0,
        "msg": "",
        "info": [
            {
                "votestotal": "67590",
                "barrage_fee": "0",
                "userlist_time": "15",
                "chatserver": "https://sohg82.55ffsgi.xyz",
                "linkmic_uid": "0",
                "linkmic_pull": "",
                "nums": "0",
                "game": [],
                "gamebet": [
                    "0"
                ],
                "gametime": "0",
                "gameid": "0",
                "gameaction": "0",
                "game_bankerid": "0",
                "game_banker_name": "吕布",
                "game_banker_avatar": "",
                "game_banker_coin": "0",
                "game_banker_limit": "0",
                "speak_limit": "0",
                "barrage_limit": "0",
                "vip": {
                    "type": "1",
                    "endtime": ""
                },
                "liang": {
                    "name": "1"
                },
                "issuper": "1",
                "usertype": "30",
                "turntable_switch": "1",
                "level": "5",
                "isattention": "0",
                "coin": "0",
                "guard": {
                    "type": "0",
                    "endtime": "0"
                },
                "guard_nums": "4",
                "pkinfo": {
                    "pkuid": "0",
                    "pkpull": "0",
                    "ifpk": "0",
                    "pk_time": "0",
                    "pk_gift_liveuid": "0",
                    "pk_gift_pkuid": "0"
                },
                "isred": "0",
                "jackpot_level": "-1",
                "show_goods": {
                    "goodsid": "0",
                    "goods_name": "",
                    "goods_thumb": "",
                    "goods_price": "",
                    "goods_type": "0"
                },
                "pull": "",
                "mic_list": [],
                "dailytask_switch": "0"
            }
        ]
    },
    "msg": ""
};

$done({
  status: 200,
  headers: {
    "Content-Type": "application/json; charset=utf-8"
  },
  body: JSON.stringify(body)
});
