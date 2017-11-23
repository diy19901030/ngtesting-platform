package com.ngtesting.platform.service.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.ngtesting.platform.entity.TestPlan;
import com.ngtesting.platform.entity.TestRun;
import com.ngtesting.platform.service.PlanService;
import com.ngtesting.platform.service.RunService;
import com.ngtesting.platform.vo.TestPlanVo;
import com.ngtesting.platform.vo.TestRunVo;
import org.apache.commons.lang.StringUtils;
import org.hibernate.criterion.DetachedCriteria;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.LinkedList;
import java.util.List;

@Service
public class PlanServiceImpl extends BaseServiceImpl implements PlanService {

    @Autowired
    RunService runService;

    @Override
    public List<TestPlan> query(JSONObject json) {
        Long projectId = json.getLong("projectId");
        String status = json.getString("status");
        String keywords = json.getString("keywords");

        DetachedCriteria dc = DetachedCriteria.forClass(TestPlan.class);

        if (projectId != null) {
            dc.add(Restrictions.eq("projectId", projectId));
        }
        if (StringUtils.isNotEmpty(status)) {
            dc.add(Restrictions.eq("status", TestPlan.PlanStatus.valueOf(status)));
        }
        if (StringUtils.isNotEmpty(keywords)) {
            dc.add(Restrictions.like("name", "%" + keywords + "%"));
        }

        dc.add(Restrictions.eq("deleted", Boolean.FALSE));
        dc.add(Restrictions.eq("disabled", Boolean.FALSE));
        dc.addOrder(Order.desc("createTime"));
        dc.addOrder(Order.asc("id"));
        List<TestPlan> ls = findAllByCriteria(dc);

        return ls;
    }

    @Override
    public TestPlanVo getById(Long caseId) {
        TestPlan po = (TestPlan) get(TestPlan.class, caseId);
        TestPlanVo vo = genVo(po);

        return vo;
    }

    @Override
    public List<TestPlanVo> genVos(List<TestPlan> pos) {
        List<TestPlanVo> vos = new LinkedList<TestPlanVo>();

        for (TestPlan po : pos) {
            TestPlanVo vo = genVo(po);
            vos.add(vo);
        }
        return vos;
    }

    @Override
    public TestPlan save(JSONObject json) {
        Long id = json.getLong("id");

        TestPlan po;
        TestPlanVo vo = JSON.parseObject(JSON.toJSONString(json), TestPlanVo.class);

        if (id != null) {
            po = (TestPlan)get(TestPlan.class, id);
        } else {
            po = new TestPlan();
        }
        po.setName(vo.getName());
        po.setEstimate(vo.getEstimate());
        po.setStartTime(vo.getStartTime());
        po.setEndTime(vo.getEndTime());
        po.setDescr(vo.getDescr());
        po.setProjectId(vo.getProjectId());

        saveOrUpdate(po);

        return po;
    }

    @Override
    public TestPlan delete(Long id, Long clientId) {
        TestPlan po = (TestPlan)get(TestPlan.class, id);
        po.setDeleted(true);
        saveOrUpdate(po);
        return po;
    }

    private Integer getChildMaxOrderNumb(TestPlan parent) {
        String hql = "select max(ordr) from TestPlan where parentId = " + parent.getId();
        Integer maxOrder = (Integer) getByHQL(hql);

        if (maxOrder == null) {
            maxOrder = 0;
        }

        return maxOrder;
    }

    public List traverseFolder(String path, List<String> fileList) {
        File file = new File(path);
        if (file.exists()) {
            File[] files = file.listFiles();
            if (files.length == 0) {
                System.out.println("文件夹是空的!");
            } else {
                for (File file2 : files) {
                    if (file2.isDirectory()) {
                        System.out.println("文件夹:" + file2.getAbsolutePath());
                        traverseFolder(file2.getAbsolutePath(), fileList);
                    } else {
                        System.out.println("文件:" + file2.getAbsolutePath());
                        if (file2.getAbsolutePath().lastIndexOf(".txt") > 0) {
                            fileList.add(file2.getAbsolutePath());
                        }
                    }
                }
            }
        } else {
            System.out.println("文件不存在!");
        }

        return fileList;
    }

    @Override
    public TestPlanVo genVo(TestPlan po) {
        TestPlanVo vo = new TestPlanVo();

        vo.setId(po.getId());
        vo.setName(po.getName());
        vo.setEstimate(po.getEstimate());
        vo.setStartTime(po.getStartTime());
        vo.setEndTime(po.getEndTime());
        vo.setDescr(po.getDescr());
        vo.setProjectId(po.getProjectId());

        for (TestRun run : po.getRuns()) {
            TestRunVo runVo = runService.genVo(run);
            vo.getRunVos().add(runVo);
        }

        return vo;
    }

    @Override
    public TestPlan updatePo(TestPlanVo vo) {
        TestPlan po = new TestPlan();
        po.setName(vo.getName());
        po.setName(vo.getName());
        po.setEstimate(vo.getEstimate());
        po.setStartTime(vo.getStartTime());
        po.setEndTime(vo.getEndTime());
        po.setDescr(vo.getDescr());
        po.setProjectId(vo.getProjectId());

        return po;
    }

}

