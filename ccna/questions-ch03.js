const CCNA_CHAPTER_03_QUESTIONS = [
  {
    "id": "network-20260803-ch03-01",
    "chapter": "第03章",
    "session": "2026-08-03",
    "topic": "Ethernet II",
    "question": "Ethernet IIの「II」が表すものはどれ？",
    "choices": [
      "IEEE 802.3の第2層",
      "送信元MACと宛先MACの2種類",
      "Ethernet Version 2",
      "2本のLANケーブルを使う方式"
    ],
    "answer": 2,
    "explanation": "IIはローマ数字の2で、Ethernet Version 2を表す。OSI参照モデルのレイヤ2という意味ではない。Ethernet IIではEtherTypeでIPv4・ARP・IPv6などの中身を識別する。"
  },
  {
    "id": "network-20260803-ch03-02",
    "chapter": "第03章",
    "session": "2026-08-03",
    "topic": "Ethernet II",
    "question": "00:AA:AA:AA:AA:AA、00-AA-AA-AA-AA-AA、00aa.aaaa.aaaaの関係として正しいものはどれ？",
    "choices": [
      "大文字・小文字と区切り方が違うだけで、同じMACアドレス",
      "コロン形式だけが有効なMACアドレス",
      "3つはそれぞれ異なるMACアドレス",
      "ピリオド形式はIPアドレスを表す"
    ],
    "answer": 0,
    "explanation": "MACアドレスは48ビットの数値で、16進数のA〜Fは大文字・小文字を区別しない。コロン、ハイフン、ピリオドも表示形式の違い。"
  },
  {
    "id": "network-20260803-ch03-03",
    "chapter": "第03章",
    "session": "2026-08-03",
    "topic": "次ホップMAC",
    "question": "【前提】PCは別ネットワークのWebサーバーへIPv4パケットを送る。デフォルトゲートウェイは192.168.1.1で、ARPによりそのLAN側MACがR-LAN-MACだと解決済み。PCが最初に作るEthernetフレームの宛先MACはどれ？",
    "choices": [
      "PC自身のMAC",
      "途中のスイッチ自身のMAC",
      "最終目的のWebサーバーのMAC",
      "R-LAN-MAC"
    ],
    "answer": 3,
    "explanation": "別ネットワーク宛てでは、最初のEthernet区間の次の相手はデフォルトゲートウェイ。宛先MACはR-LAN-MAC、フレーム内のIPパケットの宛先IPは最終目的のWebサーバーになる。"
  },
  {
    "id": "network-20260803-ch03-04",
    "chapter": "第03章",
    "session": "2026-08-03",
    "topic": "MACアドレス学習",
    "question": "スイッチがFa0/3でフレームを受信したとき、MACアドレステーブルへ動的に学習する情報はどれ？",
    "choices": [
      "宛先MACとフレームを送出したポート",
      "送信元MACと受信したFa0/3",
      "送信元IPとTCPポート番号",
      "宛先IPとデフォルトゲートウェイ"
    ],
    "answer": 1,
    "explanation": "スイッチが確実に分かるのは、送信元MACの端末から来たフレームがFa0/3へ入ったという事実。送信元MACと受信ポートを対応付けて学習する。"
  },
  {
    "id": "network-20260803-ch03-05",
    "chapter": "第03章",
    "session": "2026-08-03",
    "topic": "未知ユニキャスト",
    "question": "スイッチがFa0/2で受信したフレームの宛先MACを、同じVLANのMACアドレステーブルから見つけられなかった。正しい動作はどれ？",
    "choices": [
      "宛先不明なので必ず破棄する",
      "Fa0/2だけへ送り返す",
      "同じVLAN内のFa0/2以外のポートへフラッディングする",
      "異なるVLANを含む全ポートへ必ず送る"
    ],
    "answer": 2,
    "explanation": "未知ユニキャストは、受信ポートを除く同じVLAN内のポートへフラッディングする。異なるVLANへは広げない。"
  },
  {
    "id": "network-20260803-ch03-06",
    "chapter": "第03章",
    "session": "2026-08-03",
    "topic": "MACアドレステーブル",
    "question": "show mac address-tableの表示「20  00dd.dddd.dddd  DYNAMIC  Fa0/8」が表すものはどれ？",
    "choices": [
      "VLAN 20内のMACアドレスを、スイッチがFa0/8で動的に学習した",
      "Fa0/8へVLAN 20の全フレームを無条件で送る",
      "Fa0/8のIPアドレスが00dd.dddd.ddddである",
      "管理者がTCPポート20をFa0/8へ静的登録した"
    ],
    "answer": 0,
    "explanation": "VLAN列は所属するVLAN、Mac Address列は学習したMAC、DYNAMICは動的学習、Ports列は受信ポートを表す。"
  },
  {
    "id": "network-20260803-ch03-07",
    "chapter": "第03章",
    "session": "2026-08-03",
    "topic": "VLAN別MACアドレステーブル",
    "question": "同じスイッチが、同じMACアドレスをVLAN 10ではFa0/1、VLAN 20ではFa0/5から受信した。学習結果として正しいものはどれ？",
    "choices": [
      "MACアドレスが同じなので、VLAN 20の情報は必ず破棄する",
      "Fa0/1とFa0/5を物理的に1本のポートへ統合する",
      "VLAN番号に関係なく、最後に受信した1行だけを全VLANで共有する",
      "VLAN 10の行とVLAN 20の行を、別々のMACアドレステーブル情報として保持できる"
    ],
    "answer": 3,
    "explanation": "MACアドレステーブルはVLANごとに扱われるため、同じMACでもVLAN 10とVLAN 20で別の受信ポートを記録できる。同じVLAN内で同じMACが複数ポート間を移動すると不安定化する。"
  },
  {
    "id": "network-20260803-ch03-08",
    "chapter": "第03章",
    "session": "2026-08-03",
    "topic": "TCP",
    "question": "TCPの役割として最も適切なものはどれ？",
    "choices": [
      "LANケーブルを挿す物理ポートを識別する",
      "アプリケーション間で、順序確認や再送を行いながら信頼性のある通信を提供する",
      "MACアドレスから機器メーカーだけを検索する",
      "スイッチ間のループを防止する"
    ],
    "answer": 1,
    "explanation": "TCPはトランスポート層のプロトコル。シーケンス番号、確認応答、再送、ポート番号などを使い、アプリケーション間へ順序どおりの信頼性あるバイト列を届ける。"
  },
  {
    "id": "network-20260803-ch03-09",
    "chapter": "第03章",
    "session": "2026-08-03",
    "topic": "ブロードキャストストーム",
    "question": "3台のスイッチが三角形に接続され、STPが動作していない。ブロードキャストフレームが入ると起こりやすいものはどれ？",
    "choices": [
      "フレームは最初の1回だけ転送されて必ず停止する",
      "ルーターが自動で全スイッチの電源を切る",
      "フレームが循環・複製され、ブロードキャストストームが起こる",
      "すべてのMACアドレスがIPアドレスへ変換される"
    ],
    "answer": 2,
    "explanation": "EthernetフレームにはIPのTTLのような仕組みがない。レイヤ2ループ内でフラッディングされたフレームが循環・複製されると、帯域や機器の処理能力を消費する。"
  },
  {
    "id": "network-20260803-ch03-10",
    "chapter": "第03章",
    "session": "2026-08-03",
    "topic": "STP",
    "question": "STPの基本的な役割はどれ？",
    "choices": [
      "冗長経路の一部を論理的にブロックし、レイヤ2ループを防ぎながら予備経路を残す",
      "ループしているLANケーブルを物理的に切断する",
      "すべてのスイッチポートを常に停止する",
      "TCPポート番号をMACアドレスへ変換する"
    ],
    "answer": 0,
    "explanation": "STPは冗長な物理接続を残したまま、一部のポートを論理的にブロックしてループのない構成を作る。障害時には再計算して予備経路を利用できる。"
  }
];
