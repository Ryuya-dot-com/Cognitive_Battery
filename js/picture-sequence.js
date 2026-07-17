// ==================== Picture Sequence Memory Test ====================

I18n.register('pictureSequence', {
    ja: {
        name: '系列記憶課題',
        domain: 'エピソード記憶',
        themes: {
            morning: '朝の準備',
            cooking: '料理を作る',
            travel: '旅行の準備',
            office: 'オフィスの一日',
        },
        instructions: {
            title: '系列記憶課題',
            themeIntro: '「{theme}」をテーマにした絵が順番に表示されます。',
            shuffled: 'すべての絵が表示された後、それらがシャッフル（並び替え）されます。',
            reorder: '元の正しい順序に並べ直してください。',
            repeats: 'この作業を<strong>{count}回</strong>繰り返します（同じ系列）。',
            practiceFirst: 'まず短い系列で練習します。',
            startPractice: '練習開始',
        },
        practice: {
            completeTitle: '練習完了',
            adjacentScore: '隣接ペア正答数: {score} / {max}',
            testItems: '本番では {count} 枚の絵を正しい順序に並べます。',
            startTest: '本番開始',
        },
        status: {
            learningTrial: '学習試行 {current} / {total}',
            fullSequence: '全体を確認してください',
            adjacentPairs: '隣接ペア: {score} / {max}',
        },
        reorder: {
            heading: '正しい順序に並べてください（左から右へ）',
            sourceHeading: 'アイテムを選んで上のスロットに配置してください',
            candidatesAria: '配置候補アイテム',
            occupiedAria: '{position}番目: {label}（押すと取り消し）',
            emptyAria: '{position}番目のスロット（空）',
            placeSuffix: ' — Enter で配置',
            confirm: '確定',
            keyboardHint: 'キーボード: Tab で移動、Enter / Space で選択・配置・取り消し',
            selected: '選択中: {label}',
        },
        result: {
            detail: '{score} / {max} 隣接ペア',
        },
        items: {
            morning_alarm: '目覚ましが鳴る',
            morning_get_up: 'ベッドから起きる',
            morning_brush_teeth: '歯を磨く',
            morning_shower: 'シャワーを浴びる',
            morning_dry_hair: '髪を乾かす',
            morning_get_dressed: '服を着る',
            morning_make_breakfast: '朝食を作る',
            morning_drink_coffee: 'コーヒーを飲む',
            morning_check_phone: 'スマホを確認する',
            morning_put_on_shoes: '靴を履く',
            morning_take_bag: 'カバンを持つ',
            morning_leave_home: '玄関を出る',
            morning_walk_station: '駅まで歩く',
            morning_board_train: '電車に乗る',
            morning_arrive_office: '会社に着く',
            morning_practice_night: '夜になる',
            morning_practice_sit_sofa: 'ソファに座る',
            morning_practice_watch_tv: 'テレビを見る',
            morning_practice_sleep: '寝る',
            cooking_check_recipe: 'レシピを見る',
            cooking_go_shopping: '買い物に行く',
            cooking_buy_vegetables: '野菜を買う',
            cooking_buy_meat: '肉を買う',
            cooking_return_home: '家に帰る',
            cooking_wash_hands: '手を洗う',
            cooking_wash_vegetables: '野菜を洗う',
            cooking_cut_vegetables: '野菜を切る',
            cooking_saute_onion: '玉ねぎを炒める',
            cooking_cook_meat: '肉を焼く',
            cooking_add_seasoning: '調味料を加える',
            cooking_simmer: '煮込む',
            cooking_serve_rice: 'ごはんを盛る',
            cooking_plate_food: 'お皿に盛る',
            cooking_eat: '食べる',
            cooking_practice_morning: '朝になる',
            cooking_practice_go_kitchen: 'キッチンに行く',
            cooking_practice_make_tea: 'お茶を入れる',
            cooking_practice_eat_snack: 'お菓子を食べる',
            travel_check_calendar: 'カレンダーを確認する',
            travel_book_flight: '航空券を予約する',
            travel_book_hotel: 'ホテルを予約する',
            travel_take_suitcase: 'スーツケースを出す',
            travel_do_laundry: '洗濯をする',
            travel_fold_clothes: '衣類をたたむ',
            travel_pack_charger: '充電器を入れる',
            travel_pack_medicine: '常備薬をまとめる',
            travel_prepare_cash: '現金を用意する',
            travel_read_guidebook: 'ガイドブックを読む',
            travel_check_map: '地図を確認する',
            travel_lock_home: '家の鍵をかける',
            travel_take_taxi: 'タクシーに乗る',
            travel_board_plane: '飛行機に搭乗する',
            travel_arrive_destination: '目的地に到着する',
            travel_practice_mail_letter: '手紙を出す',
            travel_practice_receive_reply: '返事が届く',
            travel_practice_write_reply: '返信を書く',
            travel_practice_send_email: 'メールを送る',
            office_arrive: '会社に到着する',
            office_enter: '入口を通る',
            office_make_coffee: 'コーヒーを淹れる',
            office_start_computer: 'パソコンを起動する',
            office_check_email: 'メールを確認する',
            office_check_schedule: '予定を確認する',
            office_morning_meeting: '朝会に出る',
            office_write_report: '報告書を書く',
            office_make_call: '電話をかける',
            office_eat_lunch: '昼食を食べる',
            office_prepare_materials: '資料を作成する',
            office_attend_meeting: '会議に出る',
            office_print_documents: '書類を印刷する',
            office_save_file: 'ファイルを保存する',
            office_leave_work: '退勤する',
            office_practice_go_supermarket: 'スーパーに行く',
            office_practice_take_basket: 'カゴを取る',
            office_practice_pay_checkout: 'レジで払う',
            office_practice_return_home: '家に帰る',
        },
    },
    en: {
        name: 'Picture Sequence Memory Task',
        domain: 'Episodic Memory',
        themes: {
            morning: 'Getting Ready in the Morning',
            cooking: 'Preparing a Meal',
            travel: 'Preparing for a Trip',
            office: 'A Day at the Office',
        },
        instructions: {
            title: 'Picture Sequence Memory Task',
            themeIntro: 'Pictures about “{theme}” will appear one at a time in a sequence.',
            shuffled: 'After all pictures have appeared, they will be shuffled.',
            reorder: 'Put them back into the original correct order.',
            repeats: 'You will repeat this task <strong>{count} times</strong> with the same sequence.',
            practiceFirst: 'You will first practice with a short sequence.',
            startPractice: 'Start practice',
        },
        practice: {
            completeTitle: 'Practice complete',
            adjacentScore: 'Correct adjacent pairs: {score} / {max}',
            testItems: 'In the test, you will arrange {count} pictures in the correct order.',
            startTest: 'Start test',
        },
        status: {
            learningTrial: 'Learning trial {current} / {total}',
            fullSequence: 'Review the full sequence',
            adjacentPairs: 'Adjacent pairs: {score} / {max}',
        },
        reorder: {
            heading: 'Arrange the pictures in the correct order (left to right)',
            sourceHeading: 'Select an item, then place it in a slot above',
            candidatesAria: 'Items available to place',
            occupiedAria: 'Position {position}: {label} (press to remove)',
            emptyAria: 'Position {position}, empty slot',
            placeSuffix: ' — press Enter to place',
            confirm: 'Confirm',
            keyboardHint: 'Keyboard: Tab to move; Enter / Space to select, place, or remove',
            selected: 'Selected: {label}',
        },
        result: {
            detail: '{score} / {max} adjacent pairs',
        },
        items: {
            morning_alarm: 'Alarm rings',
            morning_get_up: 'Get out of bed',
            morning_brush_teeth: 'Brush teeth',
            morning_shower: 'Take a shower',
            morning_dry_hair: 'Dry hair',
            morning_get_dressed: 'Get dressed',
            morning_make_breakfast: 'Make breakfast',
            morning_drink_coffee: 'Drink coffee',
            morning_check_phone: 'Check phone',
            morning_put_on_shoes: 'Put on shoes',
            morning_take_bag: 'Pick up bag',
            morning_leave_home: 'Leave home',
            morning_walk_station: 'Walk to the station',
            morning_board_train: 'Board the train',
            morning_arrive_office: 'Arrive at the office',
            morning_practice_night: 'Night falls',
            morning_practice_sit_sofa: 'Sit on the sofa',
            morning_practice_watch_tv: 'Watch television',
            morning_practice_sleep: 'Go to sleep',
            cooking_check_recipe: 'Check the recipe',
            cooking_go_shopping: 'Go shopping',
            cooking_buy_vegetables: 'Buy vegetables',
            cooking_buy_meat: 'Buy meat',
            cooking_return_home: 'Return home',
            cooking_wash_hands: 'Wash hands',
            cooking_wash_vegetables: 'Wash vegetables',
            cooking_cut_vegetables: 'Cut vegetables',
            cooking_saute_onion: 'Sauté the onion',
            cooking_cook_meat: 'Cook the meat',
            cooking_add_seasoning: 'Add seasoning',
            cooking_simmer: 'Simmer the food',
            cooking_serve_rice: 'Serve the rice',
            cooking_plate_food: 'Plate the food',
            cooking_eat: 'Eat the meal',
            cooking_practice_morning: 'Morning begins',
            cooking_practice_go_kitchen: 'Go to the kitchen',
            cooking_practice_make_tea: 'Make tea',
            cooking_practice_eat_snack: 'Eat a snack',
            travel_check_calendar: 'Check the calendar',
            travel_book_flight: 'Book a flight',
            travel_book_hotel: 'Book a hotel',
            travel_take_suitcase: 'Take out the suitcase',
            travel_do_laundry: 'Do the laundry',
            travel_fold_clothes: 'Fold clothes',
            travel_pack_charger: 'Pack the charger',
            travel_pack_medicine: 'Pack regular medication',
            travel_prepare_cash: 'Prepare cash',
            travel_read_guidebook: 'Read the guidebook',
            travel_check_map: 'Check the map',
            travel_lock_home: 'Lock the house',
            travel_take_taxi: 'Take a taxi',
            travel_board_plane: 'Board the airplane',
            travel_arrive_destination: 'Arrive at the destination',
            travel_practice_mail_letter: 'Mail a letter',
            travel_practice_receive_reply: 'Receive a reply',
            travel_practice_write_reply: 'Write a reply',
            travel_practice_send_email: 'Send an email',
            office_arrive: 'Arrive at the office',
            office_enter: 'Enter the building',
            office_make_coffee: 'Make coffee',
            office_start_computer: 'Start the computer',
            office_check_email: 'Check email',
            office_check_schedule: 'Check the schedule',
            office_morning_meeting: 'Attend the morning meeting',
            office_write_report: 'Write a report',
            office_make_call: 'Make a phone call',
            office_eat_lunch: 'Eat lunch',
            office_prepare_materials: 'Prepare materials',
            office_attend_meeting: 'Attend a meeting',
            office_print_documents: 'Print documents',
            office_save_file: 'Save the file',
            office_leave_work: 'Leave work',
            office_practice_go_supermarket: 'Go to the supermarket',
            office_practice_take_basket: 'Take a basket',
            office_practice_pay_checkout: 'Pay at the checkout',
            office_practice_return_home: 'Return home',
        },
    },
});

const PictureSequenceTest = {
    STIMULUS_BANK_VERSION: 'picture-sequence-emoji-bank-2026-07-i18n-v1',
    ITEM_DISPLAY_MS: 2200,
    MOVE_ANIM_MS: 1500,
    FULL_SEQ_DISPLAY_MS: 3000,
    LEARNING_TRIALS: 3,

    THEMES: {
        morning: {
            name: "朝の準備",
            items15: [
                { id: 'morning_alarm', emoji: "\u23F0", label: "目覚ましが鳴る" },
                { id: 'morning_get_up', emoji: "\uD83D\uDECF\uFE0F", label: "ベッドから起きる" },
                { id: 'morning_brush_teeth', emoji: "\uD83E\uDEA5", label: "歯を磨く" },
                { id: 'morning_shower', emoji: "\uD83D\uDEBF", label: "シャワーを浴びる" },
                { id: 'morning_dry_hair', emoji: "\uD83E\uDDF4", label: "髪を乾かす" },
                { id: 'morning_get_dressed', emoji: "\uD83D\uDC55", label: "服を着る" },
                { id: 'morning_make_breakfast', emoji: "\uD83C\uDF73", label: "朝食を作る" },
                { id: 'morning_drink_coffee', emoji: "\u2615", label: "コーヒーを飲む" },
                { id: 'morning_check_phone', emoji: "\uD83D\uDCF1", label: "スマホを確認する" },
                { id: 'morning_put_on_shoes', emoji: "\uD83D\uDC5F", label: "靴を履く" },
                { id: 'morning_take_bag', emoji: "\uD83D\uDCBC", label: "カバンを持つ" },
                { id: 'morning_leave_home', emoji: "\uD83D\uDEAA", label: "玄関を出る" },
                { id: 'morning_walk_station', emoji: "\uD83D\uDEB6", label: "駅まで歩く" },
                { id: 'morning_board_train', emoji: "\uD83D\uDE83", label: "電車に乗る" },
                { id: 'morning_arrive_office', emoji: "\uD83C\uDFE2", label: "会社に着く" },
            ],
            items9: [
                { id: 'morning_alarm', emoji: "\u23F0", label: "目覚ましが鳴る" },
                { id: 'morning_get_up', emoji: "\uD83D\uDECF\uFE0F", label: "ベッドから起きる" },
                { id: 'morning_brush_teeth', emoji: "\uD83E\uDEA5", label: "歯を磨く" },
                { id: 'morning_get_dressed', emoji: "\uD83D\uDC55", label: "服を着る" },
                { id: 'morning_make_breakfast', emoji: "\uD83C\uDF73", label: "朝食を作る" },
                { id: 'morning_drink_coffee', emoji: "\u2615", label: "コーヒーを飲む" },
                { id: 'morning_put_on_shoes', emoji: "\uD83D\uDC5F", label: "靴を履く" },
                { id: 'morning_leave_home', emoji: "\uD83D\uDEAA", label: "玄関を出る" },
                { id: 'morning_board_train', emoji: "\uD83D\uDE83", label: "電車に乗る" },
            ],
            practice: [
                { id: 'morning_practice_night', emoji: "\uD83C\uDF19", label: "夜になる" },
                { id: 'morning_practice_sit_sofa', emoji: "\uD83D\uDECB\uFE0F", label: "ソファに座る" },
                { id: 'morning_practice_watch_tv', emoji: "\uD83D\uDCFA", label: "テレビを見る" },
                { id: 'morning_practice_sleep', emoji: "\uD83D\uDCA4", label: "寝る" },
            ],
        },
        cooking: {
            name: "料理を作る",
            items15: [
                { id: 'cooking_check_recipe', emoji: "\uD83D\uDCD6", label: "レシピを見る" },
                { id: 'cooking_go_shopping', emoji: "\uD83D\uDED2", label: "買い物に行く" },
                { id: 'cooking_buy_vegetables', emoji: "\uD83E\uDD6C", label: "野菜を買う" },
                { id: 'cooking_buy_meat', emoji: "\uD83C\uDF56", label: "肉を買う" },
                { id: 'cooking_return_home', emoji: "\uD83C\uDFE0", label: "家に帰る" },
                { id: 'cooking_wash_hands', emoji: "\uD83E\uDDF4", label: "手を洗う" },
                { id: 'cooking_wash_vegetables', emoji: "\uD83E\uDD55", label: "野菜を洗う" },
                { id: 'cooking_cut_vegetables', emoji: "\uD83D\uDD2A", label: "野菜を切る" },
                { id: 'cooking_saute_onion', emoji: "\uD83E\uDDC5", label: "玉ねぎを炒める" },
                { id: 'cooking_cook_meat', emoji: "\uD83E\uDD69", label: "肉を焼く" },
                { id: 'cooking_add_seasoning', emoji: "\uD83E\uDDC2", label: "調味料を加える" },
                { id: 'cooking_simmer', emoji: "\uD83C\uDF72", label: "煮込む" },
                { id: 'cooking_serve_rice', emoji: "\uD83C\uDF5A", label: "ごはんを盛る" },
                { id: 'cooking_plate_food', emoji: "\uD83C\uDF7D\uFE0F", label: "お皿に盛る" },
                { id: 'cooking_eat', emoji: "\uD83D\uDE0B", label: "食べる" },
            ],
            items9: [
                { id: 'cooking_check_recipe', emoji: "\uD83D\uDCD6", label: "レシピを見る" },
                { id: 'cooking_go_shopping', emoji: "\uD83D\uDED2", label: "買い物に行く" },
                { id: 'cooking_buy_vegetables', emoji: "\uD83E\uDD6C", label: "野菜を買う" },
                { id: 'cooking_cut_vegetables', emoji: "\uD83D\uDD2A", label: "野菜を切る" },
                { id: 'cooking_saute_onion', emoji: "\uD83E\uDDC5", label: "玉ねぎを炒める" },
                { id: 'cooking_simmer', emoji: "\uD83C\uDF72", label: "煮込む" },
                { id: 'cooking_serve_rice', emoji: "\uD83C\uDF5A", label: "ごはんを盛る" },
                { id: 'cooking_plate_food', emoji: "\uD83C\uDF7D\uFE0F", label: "お皿に盛る" },
                { id: 'cooking_eat', emoji: "\uD83D\uDE0B", label: "食べる" },
            ],
            practice: [
                { id: 'cooking_practice_morning', emoji: "\uD83C\uDF1E", label: "朝になる" },
                { id: 'cooking_practice_go_kitchen', emoji: "\uD83E\uDDD1\u200D\uD83C\uDF73", label: "キッチンに行く" },
                { id: 'cooking_practice_make_tea', emoji: "\u2615", label: "お茶を入れる" },
                { id: 'cooking_practice_eat_snack', emoji: "\uD83C\uDF6A", label: "お菓子を食べる" },
            ],
        },
        travel: {
            name: "旅行の準備",
            items15: [
                { id: 'travel_check_calendar', emoji: "\uD83D\uDCC5", label: "カレンダーを確認する" },
                { id: 'travel_book_flight', emoji: "\uD83D\uDCBB", label: "航空券を予約する" },
                { id: 'travel_book_hotel', emoji: "\uD83C\uDFE8", label: "ホテルを予約する" },
                { id: 'travel_take_suitcase', emoji: "\uD83E\uDDF3", label: "スーツケースを出す" },
                { id: 'travel_do_laundry', emoji: "\uD83E\uDDFA", label: "洗濯をする" },
                { id: 'travel_fold_clothes', emoji: "\uD83D\uDC55", label: "衣類をたたむ" },
                { id: 'travel_pack_charger', emoji: "\uD83D\uDD0C", label: "充電器を入れる" },
                { id: 'travel_pack_medicine', emoji: "\uD83D\uDC8A", label: "常備薬をまとめる" },
                { id: 'travel_prepare_cash', emoji: "\uD83D\uDCB0", label: "現金を用意する" },
                { id: 'travel_read_guidebook', emoji: "\uD83D\uDCD6", label: "ガイドブックを読む" },
                { id: 'travel_check_map', emoji: "\uD83D\uDDFA\uFE0F", label: "地図を確認する" },
                { id: 'travel_lock_home', emoji: "\uD83D\uDD10", label: "家の鍵をかける" },
                { id: 'travel_take_taxi', emoji: "\uD83D\uDE95", label: "タクシーに乗る" },
                { id: 'travel_board_plane', emoji: "\u2708\uFE0F", label: "飛行機に搭乗する" },
                { id: 'travel_arrive_destination', emoji: "\uD83C\uDFDD\uFE0F", label: "目的地に到着する" },
            ],
            items9: [
                { id: 'travel_check_calendar', emoji: "\uD83D\uDCC5", label: "カレンダーを確認する" },
                { id: 'travel_book_flight', emoji: "\uD83D\uDCBB", label: "航空券を予約する" },
                { id: 'travel_take_suitcase', emoji: "\uD83E\uDDF3", label: "スーツケースを出す" },
                { id: 'travel_fold_clothes', emoji: "\uD83D\uDC55", label: "衣類をたたむ" },
                { id: 'travel_prepare_cash', emoji: "\uD83D\uDCB0", label: "現金を用意する" },
                { id: 'travel_lock_home', emoji: "\uD83D\uDD10", label: "家の鍵をかける" },
                { id: 'travel_take_taxi', emoji: "\uD83D\uDE95", label: "タクシーに乗る" },
                { id: 'travel_board_plane', emoji: "\u2708\uFE0F", label: "飛行機に搭乗する" },
                { id: 'travel_arrive_destination', emoji: "\uD83C\uDFDD\uFE0F", label: "目的地に到着する" },
            ],
            practice: [
                { id: 'travel_practice_mail_letter', emoji: "\uD83D\uDCE8", label: "手紙を出す" },
                { id: 'travel_practice_receive_reply', emoji: "\uD83D\uDCEC", label: "返事が届く" },
                { id: 'travel_practice_write_reply', emoji: "\uD83D\uDCDD", label: "返信を書く" },
                { id: 'travel_practice_send_email', emoji: "\uD83D\uDCE7", label: "メールを送る" },
            ],
        },
        office: {
            name: "オフィスの一日",
            items15: [
                { id: 'office_arrive', emoji: "\uD83C\uDFE2", label: "会社に到着する" },
                { id: 'office_enter', emoji: "\uD83D\uDEAA", label: "入口を通る" },
                { id: 'office_make_coffee', emoji: "\u2615", label: "コーヒーを淹れる" },
                { id: 'office_start_computer', emoji: "\uD83D\uDCBB", label: "パソコンを起動する" },
                { id: 'office_check_email', emoji: "\uD83D\uDCE7", label: "メールを確認する" },
                { id: 'office_check_schedule', emoji: "\uD83D\uDCC5", label: "予定を確認する" },
                { id: 'office_morning_meeting', emoji: "\uD83E\uDD1D", label: "朝会に出る" },
                { id: 'office_write_report', emoji: "\uD83D\uDCDD", label: "報告書を書く" },
                { id: 'office_make_call', emoji: "\uD83D\uDCDE", label: "電話をかける" },
                { id: 'office_eat_lunch', emoji: "\uD83C\uDF71", label: "昼食を食べる" },
                { id: 'office_prepare_materials', emoji: "\uD83D\uDCCA", label: "資料を作成する" },
                { id: 'office_attend_meeting', emoji: "\uD83D\uDC65", label: "会議に出る" },
                { id: 'office_print_documents', emoji: "\uD83D\uDDA8\uFE0F", label: "書類を印刷する" },
                { id: 'office_save_file', emoji: "\uD83D\uDCBE", label: "ファイルを保存する" },
                { id: 'office_leave_work', emoji: "\uD83C\uDFE0", label: "退勤する" },
            ],
            items9: [
                { id: 'office_arrive', emoji: "\uD83C\uDFE2", label: "会社に到着する" },
                { id: 'office_start_computer', emoji: "\uD83D\uDCBB", label: "パソコンを起動する" },
                { id: 'office_check_email', emoji: "\uD83D\uDCE7", label: "メールを確認する" },
                { id: 'office_morning_meeting', emoji: "\uD83E\uDD1D", label: "朝会に出る" },
                { id: 'office_eat_lunch', emoji: "\uD83C\uDF71", label: "昼食を食べる" },
                { id: 'office_attend_meeting', emoji: "\uD83D\uDC65", label: "会議に出る" },
                { id: 'office_prepare_materials', emoji: "\uD83D\uDCCA", label: "資料を作成する" },
                { id: 'office_save_file', emoji: "\uD83D\uDCBE", label: "ファイルを保存する" },
                { id: 'office_leave_work', emoji: "\uD83C\uDFE0", label: "退勤する" },
            ],
            practice: [
                { id: 'office_practice_go_supermarket', emoji: "\uD83D\uDED2", label: "スーパーに行く" },
                { id: 'office_practice_take_basket', emoji: "\uD83D\uDED2", label: "カゴを取る" },
                { id: 'office_practice_pay_checkout', emoji: "\uD83D\uDCB3", label: "レジで払う" },
                { id: 'office_practice_return_home', emoji: "\uD83C\uDFE0", label: "家に帰る" },
            ],
        },
    },

    trials: [],
    currentTheme: null,
    currentThemeKey: null,
    sequenceItems: [],
    currentLearningTrial: 0,

    stimulusLanguage() {
        const locale = (window.I18n && I18n.getLocale)
            ? I18n.getLocale()
            : (document.documentElement.lang || 'ja');
        return locale;
    },

    itemIdentity(item) {
        return item && (item.id || item.label || item.name);
    },

    itemLabel(item) {
        if (!item) return '';
        return item.id ? App.t(`pictureSequence.items.${item.id}`) : (item.label || item.name || '');
    },

    itemLabels(items) {
        return items.map(item => this.itemLabel(item)).join(';');
    },

    itemIds(items) {
        return items.map(item => this.itemIdentity(item)).join(';');
    },

    themeLabel(themeKey = this.currentThemeKey) {
        return App.t(`pictureSequence.themes.${themeKey}`);
    },

    run() {
        this.trials = [];
        this.currentLearningTrial = 0;
        const themeKeys = Object.keys(this.THEMES);
        this.currentThemeKey = themeKeys[Math.floor(App.random() * themeKeys.length)];
        this.currentTheme = this.THEMES[this.currentThemeKey];

        const seqLength = App.participantAge <= 60 ? 15 : 9;
        this.sequenceItems = seqLength === 15
            ? this.currentTheme.items15
            : this.currentTheme.items9;

        this.showInstructions();
    },

    showInstructions() {
        const content = App.getTestContent();
        content.innerHTML = `
            <div class="instructions">
                <h2>${App.t('pictureSequence.instructions.title')}</h2>
                <p>${App.t('pictureSequence.instructions.themeIntro', { theme: this.themeLabel() })}</p>
                <p>${App.t('pictureSequence.instructions.shuffled')}</p>
                <p>${App.t('pictureSequence.instructions.reorder')}</p>
                <p>${App.t('pictureSequence.instructions.repeats', { count: this.LEARNING_TRIALS })}</p>
                <p>${App.t('pictureSequence.instructions.practiceFirst')}</p>
                <button class="btn btn-primary" id="btn-ps-start">${App.t('pictureSequence.instructions.startPractice')}</button>
            </div>
        `;
        document.getElementById('btn-ps-start').addEventListener('click', () => this.startPractice());
    },

    async startPractice() {
        const practiceItems = this.currentTheme.practice;
        await this.presentSequence(practiceItems);
        const result = await this.reorderPhase(practiceItems);
        const adjPairs = this.countAdjacentPairs(result, practiceItems);

        const content = App.getTestContent();
        content.innerHTML = `
            <div class="instructions">
                <h2>${App.t('pictureSequence.practice.completeTitle')}</h2>
                <p>${App.t('pictureSequence.practice.adjacentScore', { score: adjPairs, max: practiceItems.length - 1 })}</p>
                <p>${App.t('pictureSequence.practice.testItems', { count: this.sequenceItems.length })}</p>
                <button class="btn btn-primary" id="btn-ps-test">${App.t('pictureSequence.practice.startTest')}</button>
            </div>
        `;
        App.bindPrimaryAdvance('btn-ps-test', () => this.startTest());
    },

    async startTest() {
        this.currentLearningTrial = 0;
        this.testStartTime = performance.now();
        await this.runLearningTrial();
    },

    async runLearningTrial() {
        if (this.currentLearningTrial >= this.LEARNING_TRIALS) {
            this.endTest();
            return;
        }

        const content = App.getTestContent();
        content.innerHTML = `
            <div style="color:#888; font-size:1.1rem;">${App.t('pictureSequence.status.learningTrial', {
                current: this.currentLearningTrial + 1,
                total: this.LEARNING_TRIALS,
            })}</div>
        `;
        await App.wait(1000);

        await this.presentSequence(this.sequenceItems);

        const startTime = performance.now();
        const result = await this.reorderPhase(this.sequenceItems);
        const endTime = performance.now();
        const elapsed = endTime - startTime;

        const adjPairs = this.countAdjacentPairs(result, this.sequenceItems);

        this.trials.push({
            trialNum: this.currentLearningTrial + 1,
            theme: this.themeLabel(),
            sequenceId: this.currentThemeKey,
            sequenceLength: this.sequenceItems.length,
            adjacentPairs: adjPairs,
            maxPairs: this.sequenceItems.length - 1,
            responseTime: Math.round(elapsed),
            items: this.itemLabels(this.sequenceItems),
            responseOrder: this.itemLabels(result),
            correctOrder: this.itemLabels(this.sequenceItems),
            itemIds: this.itemIds(this.sequenceItems),
            responseOrderIds: this.itemIds(result),
            correctOrderIds: this.itemIds(this.sequenceItems),
            stimulus_language: this.stimulusLanguage(),
            stimulus_bank_version: this.STIMULUS_BANK_VERSION,
            tOnset: App.sessionElapsedMs(startTime),
            tResponse: App.sessionElapsedMs(endTime),
        });

        content.innerHTML = `
            <div style="color:#4a90d9; font-size:1.3rem; font-weight:700;">
                ${App.t('pictureSequence.status.adjacentPairs', { score: adjPairs, max: this.sequenceItems.length - 1 })}
            </div>
        `;
        await App.wait(1500);

        this.currentLearningTrial++;
        this.runLearningTrial();
    },

    async presentSequence(items) {
        const content = App.getTestContent();
        const shownSlots = [];

        for (let i = 0; i < items.length; i++) {
            content.innerHTML = `
                <div class="ps-presentation">
                    <div class="ps-current-item">${items[i].emoji}</div>
                    <div class="ps-current-label">${this.itemLabel(items[i])}</div>
                    <div class="ps-sequence-display">
                        ${shownSlots.map(s => `<div class="ps-seq-slot">${s}</div>`).join('')}
                        <div class="ps-seq-slot" style="border-color:#4a90d9;"></div>
                    </div>
                </div>
            `;
            await App.wait(this.ITEM_DISPLAY_MS);

            shownSlots.push(items[i].emoji);
            content.innerHTML = `
                <div class="ps-presentation">
                    <div class="ps-current-item" style="opacity:0.3;font-size:2rem;">${items[i].emoji}</div>
                    <div class="ps-sequence-display">
                        ${shownSlots.map(s => `<div class="ps-seq-slot">${s}</div>`).join('')}
                    </div>
                </div>
            `;
            await App.wait(this.MOVE_ANIM_MS);
        }

        content.innerHTML = `
            <div class="ps-presentation">
                <div style="color:#888;margin-bottom:10px;">${App.t('pictureSequence.status.fullSequence')}</div>
                <div class="ps-sequence-display">
                    ${items.map(item => `<div class="ps-seq-slot">${item.emoji}</div>`).join('')}
                </div>
            </div>
        `;
        await App.wait(this.FULL_SEQ_DISPLAY_MS);
    },

    reorderPhase(correctItems) {
        return new Promise(resolve => {
            const content = App.getTestContent();
            const shuffled = App.shuffle([...correctItems]);
            const sourceItems = shuffled.map((item, i) => ({ ...item, sourceInstanceId: i }));
            const slots = new Array(correctItems.length).fill(null);
            let dragItem = null;

            const activateFocus = (selector) => {
                const el = content.querySelector(selector);
                if (el) el.focus();
            };

            const handleSourceActivate = (sourceInstanceId) => {
                dragItem = sourceItems.find(si => si.sourceInstanceId === sourceInstanceId);
                render({ focus: 'first-empty-slot' });
            };

            const handlePlaceAt = (slotIdx) => {
                if (!dragItem) return;
                slots[slotIdx] = dragItem;
                dragItem = null;
                const allPlaced = slots.every(s => s !== null);
                render({ focus: allPlaced ? 'confirm' : 'first-source' });
            };

            const handleRemoveAt = (slotIdx) => {
                if (slots[slotIdx] == null) return;
                slots[slotIdx] = null;
                render({ focus: 'first-source' });
            };

            const render = (opts = {}) => {
                let slotsHtml = `<div class="ps-subheading">${App.t('pictureSequence.reorder.heading')}</div>`;
                slotsHtml += '<div class="ps-drop-zone" role="list">';
                for (let i = 0; i < slots.length; i++) {
                    if (slots[i] !== null) {
                        slotsHtml += `<div class="ps-drop-slot occupied" data-slot="${i}" data-action="remove" role="button" tabindex="0" aria-label="${App.t('pictureSequence.reorder.occupiedAria', { position: i + 1, label: this.itemLabel(slots[i]) })}">${slots[i].emoji}</div>`;
                    } else {
                        slotsHtml += `<div class="ps-drop-slot" data-slot="${i}" data-action="place" role="button" tabindex="0" aria-label="${App.t('pictureSequence.reorder.emptyAria', { position: i + 1 })}${dragItem ? App.t('pictureSequence.reorder.placeSuffix') : ''}">${i + 1}</div>`;
                    }
                }
                slotsHtml += '</div>';

                const availableItems = sourceItems.filter(si =>
                    !slots.some(s => s !== null && s.sourceInstanceId === si.sourceInstanceId)
                );

                let sourceHtml = `<div class="ps-subheading">${App.t('pictureSequence.reorder.sourceHeading')}</div>`;
                sourceHtml += `<div class="ps-source-area" role="group" aria-label="${App.t('pictureSequence.reorder.candidatesAria')}">`;
                for (const item of availableItems) {
                    const selected = dragItem && dragItem.sourceInstanceId === item.sourceInstanceId;
                    sourceHtml += `<div class="ps-draggable ${selected ? 'dragging' : ''}" data-source-instance-id="${item.sourceInstanceId}" role="button" tabindex="0" aria-pressed="${selected ? 'true' : 'false'}" aria-label="${this.itemLabel(item)}">${item.emoji}</div>`;
                }
                sourceHtml += '</div>';

                const allPlaced = slots.every(s => s !== null);
                const btnHtml = allPlaced
                    ? `<button class="btn btn-primary mt-2" id="btn-ps-confirm">${App.t('pictureSequence.reorder.confirm')}</button>`
                    : '';

                const hint = `<p class="field-hint ps-keyboard-hint">${App.t('pictureSequence.reorder.keyboardHint')}</p>`;
                const currentSelection = dragItem
                    ? `<div class="ps-current-selection" aria-live="polite">${App.t('pictureSequence.reorder.selected', { label: `${dragItem.emoji} ${this.itemLabel(dragItem)}` })}</div>`
                    : '';

                content.innerHTML = slotsHtml + sourceHtml + btnHtml + hint + currentSelection;

                content.querySelectorAll('.ps-draggable').forEach(el => {
                    el.addEventListener('click', () => handleSourceActivate(parseInt(el.dataset.sourceInstanceId)));
                    el.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSourceActivate(parseInt(el.dataset.sourceInstanceId));
                        }
                    });
                });

                content.querySelectorAll('.ps-drop-slot[data-action="place"]').forEach(el => {
                    el.addEventListener('click', () => handlePlaceAt(parseInt(el.dataset.slot)));
                    el.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handlePlaceAt(parseInt(el.dataset.slot));
                        }
                    });
                });

                content.querySelectorAll('.ps-drop-slot[data-action="remove"]').forEach(el => {
                    el.addEventListener('click', () => handleRemoveAt(parseInt(el.dataset.slot)));
                    el.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Backspace' || e.key === 'Delete') {
                            e.preventDefault();
                            handleRemoveAt(parseInt(el.dataset.slot));
                        }
                    });
                });

                const confirmBtn = document.getElementById('btn-ps-confirm');
                if (confirmBtn) {
                    confirmBtn.addEventListener('click', () => resolve(slots));
                }

                // Focus management for keyboard-only users.
                switch (opts.focus) {
                    case 'first-source':
                        activateFocus('.ps-draggable');
                        break;
                    case 'first-empty-slot':
                        activateFocus('.ps-drop-slot[data-action="place"]');
                        break;
                    case 'confirm':
                        activateFocus('#btn-ps-confirm');
                        break;
                    default:
                        activateFocus('.ps-draggable');
                }
            };

            render({ focus: 'first-source' });
        });
    },

    countAdjacentPairs(response, correct) {
        let count = 0;
        for (let i = 0; i < correct.length - 1; i++) {
            const id1 = this.itemIdentity(correct[i]);
            const id2 = this.itemIdentity(correct[i + 1]);
            const pos1 = response.findIndex(r => this.itemIdentity(r) === id1);
            const pos2 = response.findIndex(r => this.itemIdentity(r) === id2);
            if (pos1 >= 0 && pos2 >= 0 && pos2 === pos1 + 1) {
                count++;
            }
        }
        return count;
    },

    endTest() {
        const totalPairs = this.trials.reduce((sum, t) => sum + t.adjacentPairs, 0);
        const maxTotal = this.trials.reduce((sum, t) => sum + t.maxPairs, 0);

        const result = {
            score: totalPairs,
            detail: App.t('pictureSequence.result.detail', { score: totalPairs, max: maxTotal }),
            theme: this.themeLabel(),
            sequenceId: this.currentThemeKey,
            stimulus_language: this.stimulusLanguage(),
            stimulus_bank_version: this.STIMULUS_BANK_VERSION,
            practiceAttempts: 1,
            testDurationMs: Math.round(performance.now() - this.testStartTime),
            timeoutCount: 0,
        };

        App.onTestComplete('picture-sequence', result, this.trials);
    },
};

App.testRegistry['picture-sequence'].module = PictureSequenceTest;
App.testRegistry['picture-sequence'].nameKey = 'pictureSequence.name';
App.testRegistry['picture-sequence'].domainKey = 'pictureSequence.domain';
