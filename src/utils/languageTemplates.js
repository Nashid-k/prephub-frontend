/**
 * Language-specific code templates and starter code
 */

export const getStarterCode = (language, problemType = 'function') => {
  const templates = {
    javascript: {
      function: `function solve(param) {
  // Your code here
  
  return result;
}`,
      class: `class Solution {
  constructor() {
    // Initialize
  }
  
  solve(param) {
    // Your code here
    return result;
  }
}`
    },
    typescript: {
      function: `function solve(param: any): any {
  // Your code here
  
  return result;
}`,
      class: `class Solution {
  constructor() {
    // Initialize
  }
  
  solve(param: any): any {
    // Your code here
    return result;
  }
}`
    },
    python: {
      function: `def solve(param):
    # Your code here
    
    return result`,
      class: `class Solution:
    def __init__(self):
        # Initialize
        pass
    
    def solve(self, param):
        # Your code here
        return result`
    },
    java: {
      function: `public class Solution {
    public static Object solve(Object param) {
        // Your code here
        
        return result;
    }
}`,
      class: `public class Solution {
    public Solution() {
        // Initialize
    }
    
    public Object solve(Object param) {
        // Your code here
        return result;
    }
}`
    },
    cpp: {
      function: `#include <iostream>
#include <vector>
using namespace std;

auto solve(auto param) {
    // Your code here
    
    return result;
}`,
      class: `#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    Solution() {
        // Initialize
    }
    
    auto solve(auto param) {
        // Your code here
        return result;
    }
};`
    },
    c: {
      function: `#include <stdio.h>
#include <stdlib.h>

void* solve(void* param) {
    // Your code here
    
    return result;
}`,
      class: `// C doesn't support classes, using struct
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    // Data members
} Solution;

void* solve(Solution* self, void* param) {
    // Your code here
    return result;
}`
    },
    csharp: {
      function: `using System;
using System.Collections.Generic;

public class Solution {
    public object Solve(object param) {
        // Your code here
        
        return result;
    }
}`,
      class: `using System;
using System.Collections.Generic;

public class Solution {
    public Solution() {
        // Initialize
    }
    
    public object Solve(object param) {
        // Your code here
        return result;
    }
}`
    },
    go: {
      function: `package main

import "fmt"

func solve(param interface{}) interface{} {
    // Your code here
    
    return result
}`,
      class: `package main

import "fmt"

type Solution struct {
    // Data members
}

func NewSolution() *Solution {
    return &Solution{}
}

func (s *Solution) Solve(param interface{}) interface{} {
    // Your code here
    return result
}`
    },
    dart: {
      function: `dynamic solve(dynamic param) {
  // Your code here
  
  return result;
}`,
      class: `class Solution {
  Solution() {
    // Initialize
  }
  
  dynamic solve(dynamic param) {
    // Your code here
    return result;
  }
}`
    },
    rust: {
      function: `fn solve(param: &str) -> String {
    // Your code here
    
    result
}`,
      class: `struct Solution {
    // Data members
}

impl Solution {
    fn new() -> Self {
        Solution {}
    }
    
    fn solve(&self, param: &str) -> String {
        // Your code here
        String::new()
    }
}`
    },
    kotlin: {
      function: `fun solve(param: Any): Any {
    // Your code here
    
    return result
}`,
      class: `class Solution {
    init {
        // Initialize
    }
    
    fun solve(param: Any): Any {
        // Your code here
        return result
    }
}`
    }
  };

  return templates[language]?.[problemType] || templates.javascript.function;
};

/**
 * Get language-specific comment syntax
 */
export const getCommentSyntax = (language) => {
  const syntax = {
    javascript: { single: '//', multi: { start: '/*', end: '*/' } },
    typescript: { single: '//', multi: { start: '/*', end: '*/' } },
    python: { single: '#', multi: { start: '"""', end: '"""' } },
    java: { single: '//', multi: { start: '/*', end: '*/' } },
    cpp: { single: '//', multi: { start: '/*', end: '*/' } },
    c: { single: '//', multi: { start: '/*', end: '*/' } },
    csharp: { single: '//', multi: { start: '/*', end: '*/' } },
    go: { single: '//', multi: { start: '/*', end: '*/' } },
    dart: { single: '//', multi: { start: '/*', end: '*/' } },
    rust: { single: '//', multi: { start: '/*', end: '*/' } },
    kotlin: { single: '//', multi: { start: '/*', end: '*/' } }
  };

  return syntax[language] || syntax.javascript;
};

/**
 * Get language-specific array/list syntax
 */
export const getArraySyntax = (language, items = []) => {
  const itemsStr = items.join(', ');
  
  const syntax = {
    javascript: `[${itemsStr}]`,
    typescript: `[${itemsStr}]`,
    python: `[${itemsStr}]`,
    java: `new int[]{${itemsStr}}`,
    cpp: `{${itemsStr}}`,
    c: `{${itemsStr}}`,
    csharp: `new int[]{${itemsStr}}`,
    go: `[]int{${itemsStr}}`,
    dart: `[${itemsStr}]`,
    rust: `vec![${itemsStr}]`,
    kotlin: `listOf(${itemsStr})`
  };

  return syntax[language] || syntax.javascript;
};

/**
 * Get language-specific print statement
 */
export const getPrintSyntax = (language, value = 'output') => {
  const syntax = {
    javascript: `console.log(${value});`,
    typescript: `console.log(${value});`,
    python: `print(${value})`,
    java: `System.out.println(${value});`,
    cpp: `std::cout << ${value} << std::endl;`,
    c: `printf("%d\\n", ${value});`,
    csharp: `Console.WriteLine(${value});`,
    go: `fmt.Println(${value})`,
    dart: `print(${value});`,
    rust: `println!("{}", ${value});`,
    kotlin: `println(${value})`
  };

  return syntax[language] || syntax.javascript;
};

export default {
  getStarterCode,
  getCommentSyntax,
  getArraySyntax,
  getPrintSyntax
};
