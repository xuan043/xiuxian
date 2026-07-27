/* ============================================================
 * 四级英语修行阁 —— 中译英题库（四级水平）
 * ============================================================ */
(function (global) {
  'use strict';

  const TRANSLATION_BANK = [
    { id: 't1', cn: '我们应该努力学习，实现自己的梦想。', ref: 'We should study hard to achieve our dreams.' },
    { id: 't2', cn: '随着科技的发展，人们的生活发生了巨大变化。', ref: 'With the development of technology, people\'s lives have changed greatly.' },
    { id: 't3', cn: '保护环境是每个人的责任。', ref: 'Protecting the environment is everyone\'s responsibility.' },
    { id: 't4', cn: '他花了三个月时间准备这次考试。', ref: 'He spent three months preparing for this exam.' },
    { id: 't5', cn: '这本书太有趣了，我忍不住一口气读完了。', ref: 'This book is so interesting that I can\'t help reading it in one go.' },
    { id: 't6', cn: '我认为锻炼身体对健康非常重要。', ref: 'I think doing exercise is very important for health.' },
    { id: 't7', cn: '如果你有任何问题，请随时联系我。', ref: 'If you have any questions, please feel free to contact me.' },
    { id: 't8', cn: '这座城市以其美丽的风景而闻名。', ref: 'This city is famous for its beautiful scenery.' },
    { id: 't9', cn: '只有坚持到最后的人才能取得成功。', ref: 'Only those who persist to the end can achieve success.' },
    { id: 't10', cn: '我们必须采取措施来减少空气污染。', ref: 'We must take measures to reduce air pollution.' },
    { id: 't11', cn: '我习惯每天早上读英语。', ref: 'I am used to reading English every morning.' },
    { id: 't12', cn: '这次旅行给我留下了深刻的印象。', ref: 'This trip left a deep impression on me.' },
    { id: 't13', cn: '虽然他很年轻，但他已经取得了很大的成就。', ref: 'Although he is young, he has already made great achievements.' },
    { id: 't14', cn: '越来越多的人开始意识到健康饮食的重要性。', ref: 'More and more people begin to realize the importance of a healthy diet.' },
    { id: 't15', cn: '老师建议我们每天至少读半小时英文。', ref: 'The teacher suggests that we read English for at least half an hour every day.' },
    { id: 't16', cn: '由于天气不好，运动会被推迟了。', ref: 'Because of the bad weather, the sports meeting was put off.' },
    { id: 't17', cn: '互联网使我们的交流变得更加方便。', ref: 'The Internet makes our communication much more convenient.' },
    { id: 't18', cn: '他不仅聪明，而且非常勤奋。', ref: 'He is not only clever but also very hard-working.' },
    { id: 't19', cn: '请把你的计划告诉我，我会尽力帮助你。', ref: 'Please tell me your plan, and I will try my best to help you.' },
    { id: 't20', cn: '学习英语最好的方法之一就是多说。', ref: 'One of the best ways to learn English is to speak more.' },
    { id: 't21', cn: '这个周末我打算和父母一起去看望祖父母。', ref: 'This weekend I plan to visit my grandparents with my parents.' },
    { id: 't22', cn: '中国政府在环保方面投入了大量资金。', ref: 'The Chinese government has invested a lot of money in environmental protection.' },
    { id: 't23', cn: '只有不断努力，我们才能克服困难。', ref: 'Only by making continuous efforts can we overcome difficulties.' },
    { id: 't24', cn: '他对音乐的热爱使他成为了一名出色的钢琴家。', ref: 'His love for music made him an excellent pianist.' },
    { id: 't25', cn: '近年来，线上教育变得越来越流行。', ref: 'In recent years, online education has become more and more popular.' }
  ];

  // 每日中译英题数
  const DAILY_TRANSLATION_LIMIT = 5;

  global.XTranslationData = { TRANSLATION_BANK, DAILY_TRANSLATION_LIMIT };
})(window);
