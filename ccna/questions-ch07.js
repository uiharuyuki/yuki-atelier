const CCNA_CHAPTER_07_QUESTIONS = [
  {
    "id": "network-20260818-ch07-01",
    "chapter": "第07章",
    "session": "2026-08-18",
    "topic": "ACL",
    "question": "IPv4 ACLの基本動作として正しい説明はどれ？",
    "choices": [
      "パケットを全ACEと照合し、最後に一致したACEだけを実行する",
      "宛先MACアドレスだけを使って出力ポートを学習する",
      "ACEを上から照合し、最初に一致したpermitまたはdenyで判定を終える",
      "一致しないパケットは必ず許可する"
    ],
    "answer": 2,
    "explanation": "ACLはACEを上から順に評価し、最初に一致した行のpermitまたはdenyを実行する。一致後に下のACEは評価しない。"
  },
  {
    "id": "network-20260818-ch07-02",
    "chapter": "第07章",
    "session": "2026-08-18",
    "topic": "暗黙のdeny",
    "question": "ACLのどのpermit条件にも一致しなかったIPv4パケットは通常どうなる？",
    "choices": [
      "ACL末尾の暗黙のdenyによって拒否される",
      "暗黙のpermitによって許可される",
      "先頭のACEへ戻って再評価される",
      "ルーティングテーブルへACL条件として登録される"
    ],
    "answer": 0,
    "explanation": "すべてのACLの末尾には暗黙のdenyがある。必要な通信を許可するACEがなければ、どの明示条件にも一致しないパケットも拒否される。"
  },
  {
    "id": "network-20260818-ch07-03",
    "chapter": "第07章",
    "session": "2026-08-18",
    "topic": "標準ACLと拡張ACL",
    "question": "標準ACLと拡張ACLの照合項目の違いとして正しいものはどれ？",
    "choices": [
      "標準ACLは宛先ポートだけ、拡張ACLは送信元MACだけを見る",
      "標準ACLは送信元IPv4アドレスを主に見て、拡張ACLは送信元・宛先・プロトコル・ポートなどを見られる",
      "標準ACLと拡張ACLは番号以外の機能が完全に同じである",
      "標準ACLはIPv6専用、拡張ACLはIPv4専用である"
    ],
    "answer": 1,
    "explanation": "標準ACLは主に送信元IPv4アドレスだけを条件にする。拡張ACLは送信元と宛先、IPプロトコル、TCP/UDPポート番号などを指定できる。"
  },
  {
    "id": "network-20260818-ch07-04",
    "chapter": "第07章",
    "session": "2026-08-18",
    "topic": "ACLの配置",
    "question": "ACL配置の基本方針として正しい組み合わせはどれ？",
    "choices": [
      "標準ACLも拡張ACLも必ず送信元ホスト上に置く",
      "標準ACLは送信元の近く、拡張ACLは宛先の近くに置く",
      "どちらもルーターのloopbackだけに置く",
      "標準ACLは宛先の近く、拡張ACLは送信元の近くに置く"
    ],
    "answer": 3,
    "explanation": "標準ACLは送信元しか区別できないため宛先近く、拡張ACLは細かく絞れるため不要通信を早く捨てられる送信元近くが基本。"
  },
  {
    "id": "network-20260818-ch07-05",
    "chapter": "第07章",
    "session": "2026-08-18",
    "topic": "ワイルドカードマスク",
    "question": "ACLのワイルドカードマスク0.0.0.255の意味はどれ？",
    "choices": [
      "最初の3オクテットは一致させ、最後のオクテットは無視する",
      "最初の3オクテットを無視し、最後だけ一致させる",
      "4オクテットすべてを完全一致させる",
      "4オクテットすべてを無視する"
    ],
    "answer": 0,
    "explanation": "ワイルドカードマスクでは0が一致、1が無視。0.0.0.255は最初の3オクテットを一致させ、最後のオクテットを任意にする。"
  },
  {
    "id": "network-20260818-ch07-06",
    "chapter": "第07章",
    "session": "2026-08-18",
    "topic": "hostとany",
    "question": "ACLでhost 10.1.1.1と同じ対象を表す指定はどれ？",
    "choices": [
      "10.1.1.1 255.255.255.255",
      "10.1.1.1 0.0.0.0",
      "10.1.1.0 0.0.0.255",
      "any 10.1.1.1"
    ],
    "answer": 1,
    "explanation": "host 10.1.1.1は10.1.1.1 0.0.0.0と同じ。ワイルドカードが全ビット0なので、その1アドレスへ完全一致する。"
  },
  {
    "id": "network-20260818-ch07-07",
    "chapter": "第07章",
    "session": "2026-08-18",
    "topic": "番号付き標準ACL",
    "question": "教材の基本範囲で、番号付き標準ACLを作成するコマンドはどれ？",
    "choices": [
      "ip access-group 1 permit 192.168.1.0 0.0.0.255",
      "show access-list 1 deny 192.168.1.0/24",
      "access-list 100 permit tcp any any",
      "access-list 1 permit 192.168.1.0 0.0.0.255"
    ],
    "answer": 3,
    "explanation": "番号付き標準ACLの基本構文はaccess-list 1〜99 permitまたはdeny 送信元 ワイルドカード。ACLの適用には別途ip access-groupを使う。"
  },
  {
    "id": "network-20260818-ch07-08",
    "chapter": "第07章",
    "session": "2026-08-18",
    "topic": "ACLの適用",
    "question": "ACL 1をGigabitEthernet0/2から出ていくパケットへ適用する設定はどれ？",
    "choices": [
      "(config-if)# access-list 1 outbound",
      "(config-if)# ip access-group 1 out",
      "(config)# ip route access-list 1 GigabitEthernet0/2",
      "(config-if)# show access-lists 1 in"
    ],
    "answer": 1,
    "explanation": "作成済みACLをインターフェースへ適用するコマンドはip access-group。対象インターフェースから外へ出る方向はout。"
  },
  {
    "id": "network-20260818-ch07-09",
    "chapter": "第07章",
    "session": "2026-08-18",
    "topic": "インバウンドACL",
    "question": "インターフェースへip access-group FILTER inを設定した。どのパケットを評価する？",
    "choices": [
      "そのインターフェースからルーター内部へ入るパケット",
      "ルーターの全インターフェースから出るパケット",
      "ルーティング後にそのインターフェースから出るパケットだけ",
      "ルーター自身が生成したログだけ"
    ],
    "answer": 0,
    "explanation": "inは、そのインターフェースからルーター内部へ入る方向。方向は送信者視点ではなく、ACLを設定したルーターの対象インターフェース視点で読む。"
  },
  {
    "id": "network-20260818-ch07-10",
    "chapter": "第07章",
    "session": "2026-08-18",
    "topic": "名前付きACL",
    "question": "名前付き標準ACL SERVER-FILTERの設定モードへ入るコマンドはどれ？",
    "choices": [
      "access-list named SERVER-FILTER standard",
      "ip access-group SERVER-FILTER standard",
      "ip access-list standard SERVER-FILTER",
      "show ip access-list SERVER-FILTER"
    ],
    "answer": 2,
    "explanation": "名前付き標準ACLはip access-list standard ACL名で設定モードへ入る。その中でシーケンス番号付きのpermitまたはdenyを作成できる。"
  },
  {
    "id": "network-20260818-ch07-11",
    "chapter": "第07章",
    "session": "2026-08-18",
    "topic": "番号付き拡張ACL",
    "question": "教材の基本範囲で拡張ACLとして扱われる番号はどれ？",
    "choices": [
      "1",
      "50",
      "99",
      "100"
    ],
    "answer": 3,
    "explanation": "教材では標準ACLを1〜99、拡張ACLを100〜199として扱う。100は拡張ACLの基本番号範囲に入る。"
  },
  {
    "id": "network-20260818-ch07-12",
    "chapter": "第07章",
    "session": "2026-08-18",
    "topic": "拡張ACLのポート指定",
    "question": "拡張ACLの末尾にあるeq wwwが表す条件はどれ？",
    "choices": [
      "送信元IPv4アドレスがwwwという名前である",
      "すべてのTCP/UDPポートを拒否する",
      "HTTPのポート80と等しいポートを指定する",
      "DNSのポート53より大きいポートを指定する"
    ],
    "answer": 2,
    "explanation": "eqは等しいことを示す演算子で、wwwはHTTPのサービス名。eq wwwはポート80を指定する。"
  },
  {
    "id": "network-20260818-ch07-13",
    "chapter": "第07章",
    "session": "2026-08-18",
    "topic": "ACLの評価順",
    "question": "192.168.1.0/24を拒否しつつ192.168.1.10だけ許可したい。ACEの正しい並びはどれ？",
    "choices": [
      "deny 192.168.1.0 0.0.0.255の後にpermit host 192.168.1.10",
      "permit host 192.168.1.10の後にdeny 192.168.1.0 0.0.0.255",
      "permit anyの後にdeny host 192.168.1.10",
      "順番は結果に影響しないため、どの並びでも同じ"
    ],
    "answer": 1,
    "explanation": "ACLは最初の一致で判定が終わる。広い/24のdenyを先に置くと例外ホストも拒否されるため、具体的なpermitを先に置く。"
  },
  {
    "id": "network-20260818-ch07-14",
    "chapter": "第07章",
    "session": "2026-08-18",
    "topic": "show access-lists",
    "question": "設定済みACLのACEと条件への一致数を確認するコマンドはどれ？",
    "choices": [
      "show ip route",
      "show interfaces trunk",
      "show access-lists",
      "show vlan brief"
    ],
    "answer": 2,
    "explanation": "show access-listsでACL番号または名前、ACEの順番、permit/deny条件、パケット一致数などを確認できる。"
  },
  {
    "id": "network-20260818-ch07-15",
    "chapter": "第07章",
    "session": "2026-08-18",
    "topic": "HTTP許可の拡張ACL",
    "question": "192.168.1.0/24からWebサーバー10.1.1.1へのHTTPだけを許可するACEはどれ？",
    "choices": [
      "access-list 100 permit tcp 192.168.1.0 0.0.0.255 host 10.1.1.1 eq www",
      "access-list 1 permit host 10.1.1.1 eq www 192.168.1.0",
      "ip access-group 100 tcp 192.168.1.0/24 10.1.1.1 80",
      "access-list 100 permit udp host 10.1.1.1 192.168.1.0 255.255.255.0"
    ],
    "answer": 0,
    "explanation": "HTTPはTCPポート80。拡張ACLではprotocol、送信元とワイルドカード、宛先、eq wwwの順に指定できる。"
  }
];
