import {stringToAny} from '../src/stringToAny';

describe('stringToAny', ()=> {
  it('should work with objects', ()=> {
    expect(stringToAny(`{ p1:1,p2:'2'}`)).toEqual({p1:1,p2:"2"});
  });
  
  describe('should work with non objects', ()=> {
    interface NonObjectTest{
      description:string
      nonObjectString:string,
      expected:any
    }
    const tests:NonObjectTest[] = [
      {
        description:'boolean true',
        nonObjectString:'true',
        expected:true
      },
      {
        description:'boolean false',
        nonObjectString:'false',
        expected:false
      },
      {
        description:'string',
        nonObjectString:`"hello"`,
        expected:"hello"
      },
      {
        description:'number',
        nonObjectString:'7',
        expected:7
      },
      {
        description:'array',
        nonObjectString:`[1,'2',true]`,
        expected:[1,'2',true]
      }
    ];
    tests.forEach(test=> {
      it(`${test.description}`,()=> {
        expect(stringToAny(test.nonObjectString)).toEqual(test.expected);
      });
    })
  });

  describe('errors', ()=> {
    it('should throw error malformed when object is malformed', () => {
      expect(()=>stringToAny('{')).toThrowError('Malformed');
    });

    it('should throw error malformed when non object is malformed', () => {
      expect(()=>stringToAny('[')).toThrowError('Malformed');
    });
  });
});