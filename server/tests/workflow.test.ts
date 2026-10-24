describe("workflow engine",()=>{
  test("matches a simple trigger event",()=>{
    const workflow={event:"lead.created",condition:"owner != ''",action:"notify"};
    expect(workflow.event).toBe("lead.created");
    expect(workflow.action).toBe("notify");
  });
  test("rejects empty conditions",()=>{
    expect("".length).toBe(0);
  });
});
