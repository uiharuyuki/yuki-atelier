const CCNA_CHAPTER_04_QUESTIONS = [
  {
    "id": "network-20260805-ch04-01",
    "chapter": "第04章",
    "session": "2026-08-05",
    "topic": "VLANとブロードキャストドメイン",
    "question": "VLANの説明として、最も適切なものはどれ？",
    "choices": [
      "1台のスイッチを複数の物理スイッチへ変換する技術",
      "スイッチ上のネットワークを論理的に分割する技術",
      "異なるIPネットワーク間を必ずルーティングする技術",
      "LANケーブルにVLANタグだけを付ける技術"
    ],
    "answer": 1,
    "explanation": "VLANは、1台または複数台のスイッチ上でネットワークを論理的に分割する技術。同じ物理スイッチ上でも、VLANが異なれば別のレイヤ2ブロードキャストドメインになる。"
  },
  {
    "id": "network-20260805-ch04-02",
    "chapter": "第04章",
    "session": "2026-08-05",
    "topic": "VLAN ID",
    "question": "VLAN IDとIPネットワーク番号の関係として正しいものはどれ？",
    "choices": [
      "VLAN10なら必ず192.168.10.0/24になる",
      "VLAN IDはIPアドレスの最後のオクテットを表す",
      "VLAN IDとIPネットワーク番号は別物で、対応は設計者が決める",
      "VLAN IDはルーターだけが持ち、スイッチには存在しない"
    ],
    "answer": 2,
    "explanation": "VLAN10という番号から192.168.10.0/24のようなIPネットワークが自動的に決まるわけではない。VLAN IDとIPネットワークの対応は設計者が決める。"
  },
  {
    "id": "network-20260805-ch04-03",
    "chapter": "第04章",
    "session": "2026-08-05",
    "topic": "アクセスポート",
    "question": "アクセスポートの説明として、最も適切なものはどれ？",
    "choices": [
      "基本的に1つのVLANへ所属し、PCやプリンターなどの端末を接続するポート",
      "複数VLANのフレームを必ず1本で運ぶポート",
      "ルーターのサブインターフェースだけを接続するポート",
      "すべてのVLANをタグなしで同時に運ぶポート"
    ],
    "answer": 0,
    "explanation": "アクセスポートは基本的に1つのVLANへ所属する。PC、プリンター、サーバーなど通常の端末を接続し、端末は通常VLANタグを意識しない。"
  },
  {
    "id": "network-20260805-ch04-04",
    "chapter": "第04章",
    "session": "2026-08-05",
    "topic": "トランクポート",
    "question": "トランクポートを使う主な場面はどれ？",
    "choices": [
      "PCを1つのVLANへ接続するときだけ",
      "スイッチ同士やスイッチとルーターの間で複数VLANを運ぶとき",
      "同じVLAN内の端末へIPアドレスを配るときだけ",
      "VLANを作成せずに通信するとき"
    ],
    "answer": 1,
    "explanation": "トランクポートは複数VLANのフレームを1本のリンクで運ぶ。スイッチ同士、スイッチとルーター、スイッチと仮想化ホストなどの接続に使う。"
  },
  {
    "id": "network-20260805-ch04-05",
    "chapter": "第04章",
    "session": "2026-08-05",
    "topic": "IEEE 802.1Q",
    "question": "IEEE 802.1Qの役割として正しいものはどれ？",
    "choices": [
      "IPアドレスを自動設定する",
      "MACアドレスをIPアドレスへ変換する",
      "トランク上のフレームにVLAN識別情報を付ける標準方式",
      "スイッチ間のループを物理的に切断する"
    ],
    "answer": 2,
    "explanation": "トランクでは複数VLANのフレームが通るため、受信側が所属VLANを判断できるようVLAN識別情報を付ける。標準方式がIEEE 802.1Qで、Ciscoコマンドではdot1qと表記する。"
  },
  {
    "id": "network-20260805-ch04-06",
    "chapter": "第04章",
    "session": "2026-08-05",
    "topic": "ネイティブVLAN",
    "question": "802.1QトランクのネイティブVLANについて正しいものはどれ？",
    "choices": [
      "通常はタグを付けずに送るVLANで、トランク両端を同じ設定にする",
      "トランクを通過できないVLANを指す",
      "必ずVLAN20に固定される特別なVLANを指す",
      "すべてのフレームへ2つのタグを付けるVLANを指す"
    ],
    "answer": 0,
    "explanation": "ネイティブVLANは802.1Qトランクで通常タグを付けずに送るVLAN。トランク両端で一致させないと、タグなしフレームの所属VLANを誤認して通信障害や意図しないVLAN混在の原因になる。"
  },
  {
    "id": "network-20260805-ch04-07",
    "chapter": "第04章",
    "session": "2026-08-05",
    "topic": "VLAN設定",
    "question": "Fa0/1をアクセスポートとしてVLAN10へ所属させる設定の組み合わせはどれ？",
    "choices": [
      "interface fa0/1 → switchport mode trunk → switchport trunk native vlan 10",
      "interface fa0/1 → switchport mode access → switchport access vlan 10",
      "interface vlan 10 → ip routing → switchport access vlan 1",
      "vlan 10 → encapsulation dot1q 10 → ip address 10.0.0.1"
    ],
    "answer": 1,
    "explanation": "端末接続用のFa0/1を選び、switchport mode accessでアクセスポートに固定し、switchport access vlan 10でVLAN10へ所属させる。"
  },
  {
    "id": "network-20260805-ch04-08",
    "chapter": "第04章",
    "session": "2026-08-05",
    "topic": "show vlan",
    "question": "show vlanで主に確認できるものはどれ？",
    "choices": [
      "VLAN ID、VLAN名、状態、各VLANへ割り当てられたアクセスポート",
      "ルーターの経路表と次ホップだけ",
      "各PCのDNSキャッシュだけ",
      "トランク上を通過する全フレームの内容だけ"
    ],
    "answer": 0,
    "explanation": "show vlanではVLAN ID、VLAN名、状態、各VLANへ割り当てられたアクセスポートを確認できる。トランクポートはアクセスポート一覧には現れない。"
  },
  {
    "id": "network-20260805-ch04-09",
    "chapter": "第04章",
    "session": "2026-08-05",
    "topic": "DTP",
    "question": "DTPの説明として正しいものはどれ？",
    "choices": [
      "Ciscoスイッチ同士がアクセス／トランクを動的に交渉する方式",
      "端末へIPアドレスを自動配布する方式",
      "VLAN間のIPルーティングを行う方式",
      "802.1Qタグを暗号化する方式"
    ],
    "answer": 0,
    "explanation": "DTPはCiscoスイッチ同士がポートのアクセス／トランクを動的に交渉する独自方式。dynamic desirableは積極的に提案し、dynamic autoは相手から提案されるとトランクになる。"
  },
  {
    "id": "network-20260805-ch04-10",
    "chapter": "第04章",
    "session": "2026-08-05",
    "topic": "VLAN間ルーティング",
    "question": "VLAN10のPCからVLAN20のPCへ通信するとき、基本的に必要なものはどれ？",
    "choices": [
      "同じVLAN内でのMACアドレス学習だけ",
      "VLAN間を接続するレイヤ3のルーティング機能",
      "VLAN10とVLAN20を同じVLAN IDに変更すること",
      "トランクポートをすべてアクセスポートに変更すること"
    ],
    "answer": 1,
    "explanation": "VLAN10とVLAN20は別のレイヤ2ブロードキャストドメインで、通常は別IPネットワークになる。異なるIPネットワーク間の通信にはルーティングが必要。"
  },
  {
    "id": "network-20260805-ch04-11",
    "chapter": "第04章",
    "session": "2026-08-05",
    "topic": "デフォルトゲートウェイ",
    "question": "192.168.1.0/24に所属するPCのデフォルトゲートウェイとして正しいものはどれ？",
    "choices": [
      "PCと同じ192.168.1.0/24上にあるルーターの192.168.1.1",
      "別ネットワーク上の192.168.2.1だけ",
      "接続先サーバーのMACアドレス",
      "VLAN IDそのものの10"
    ],
    "answer": 0,
    "explanation": "デフォルトゲートウェイは、外部宛て通信の最初の次ホップとなる、端末と同じIPサブネット上のレイヤ3アドレス。"
  },
  {
    "id": "network-20260805-ch04-12",
    "chapter": "第04章",
    "session": "2026-08-05",
    "topic": "Router on a Stick",
    "question": "Router on a Stickの構成として正しいものはどれ？",
    "choices": [
      "VLANごとにルーターの物理ポートを1本ずつ使う構成",
      "ルーターとスイッチを1本のトランクで接続し、ルーターの物理インターフェースをサブインターフェースへ分割する構成",
      "L2スイッチだけでVLAN間をルーティングする構成",
      "すべてのVLANを1つのアクセスポートへ統合する構成"
    ],
    "answer": 1,
    "explanation": "Router on a Stickは、ルーターとスイッチを1本のトランクで接続し、ルーターの物理インターフェースを複数のサブインターフェースへ論理分割する方式。"
  },
  {
    "id": "network-20260805-ch04-13",
    "chapter": "第04章",
    "session": "2026-08-05",
    "topic": "サブインターフェース",
    "question": "Router on a Stickで、VLAN10をFa0/0.1に対応させる設定はどれ？",
    "choices": [
      "interface fa0/0.1 → encapsulation dot1q 10",
      "interface fa0/0.1 → switchport access vlan 10",
      "interface vlan 10 → switchport mode trunk",
      "interface fa0/0 → ip default-gateway 10"
    ],
    "answer": 0,
    "explanation": "サブインターフェースでVLANとの対応を決めるのはencapsulation dot1q 10。サブインターフェース番号の1という見た目だけでVLAN10になるわけではない。"
  },
  {
    "id": "network-20260805-ch04-14",
    "chapter": "第04章",
    "session": "2026-08-05",
    "topic": "L3スイッチとSVI",
    "question": "L3スイッチでVLAN間ルーティングを行う基本設定として正しいものはどれ？",
    "choices": [
      "ip routingを有効にし、各VLANのSVIへIPアドレスを設定する",
      "すべてのポートをハブへ変更する",
      "show vlanだけを実行する",
      "ip default-gatewayだけを設定する"
    ],
    "answer": 0,
    "explanation": "L3スイッチではip routingを有効にし、interface vlan 10のように各VLANのSVIへIPアドレスを設定する。そのSVIのIPを各VLAN端末のデフォルトゲートウェイにできる。"
  },
  {
    "id": "network-20260805-ch04-15",
    "chapter": "第04章",
    "session": "2026-08-05",
    "topic": "管理VLAN",
    "question": "L2スイッチ自身へSSHなどで接続するための管理IPについて正しいものはどれ？",
    "choices": [
      "フレーム転送だけなら不要だが、管理通信のため管理VLANのSVIへ設定する",
      "必ず物理ポートそのものへ設定する",
      "端末のVLAN IDへ直接設定する",
      "ip routingを有効にしないと管理IPは設定できない"
    ],
    "answer": 0,
    "explanation": "L2スイッチのフレーム転送はMACアドレスで行うため転送だけなら自身のIPは不要。ただしSSH、TELNET、SNMPなどの管理通信には、管理VLANのSVIへ管理IPを設定する。"
  }
];
